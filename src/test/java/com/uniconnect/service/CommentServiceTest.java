package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Comment;
import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostService postService;

    private CommentService commentService;
    private User author;
    private Post post;

    @BeforeEach
    void setUp() {
        // Initialize service
        commentService = new CommentService(commentRepository, postService);

        // Setup dummy data
        author = new User();
        author.setUserId(1L);
        author.setUsername("Student1");

        post = new Post();
        post.setPostId(10L);
        post.setContent("Some post content");
    }

    // --- CONSTRUCTOR TEST ---
    @Test
    void testCommentServiceConstructor() {
        CommentService service = new CommentService(commentRepository, postService);
        assertNotNull(service, "CommentService instance should be created");
    }

    // --- FUNCTIONALITY TEST 1: Create Comment ---
    @Test
    void testCreateComment_Success() {
        // Arrange
        String content = "Great post!";
        when(postService.getById(post.getPostId())).thenReturn(post);
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Comment result = commentService.createComment(author, post.getPostId(), content);

        // Assert
        assertNotNull(result);
        assertEquals(content, result.getContent());
        assertEquals(author, result.getAuthor());
        assertEquals(post, result.getPost());
        assertNotNull(result.getTimestamp());

        verify(postService).getById(post.getPostId());
        verify(commentRepository).save(any(Comment.class));
    }

    // --- FUNCTIONALITY TEST 2: Get Comments by Post ---
    @Test
    void testGetByPost_ReturnsList() {
        // Arrange
        Comment c1 = new Comment();
        c1.setContent("First!");

        when(postService.getById(post.getPostId())).thenReturn(post);
        when(commentRepository.findByPost(post)).thenReturn(Collections.singletonList(c1));

        // Act
        List<Comment> result = commentService.getByPost(post.getPostId());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("First!", result.get(0).getContent());
        verify(commentRepository).findByPost(post);
    }

    // --- FUNCTIONALITY TEST 3: Delete Comment (Error Handling) ---
    @Test
    void testDeleteComment_ThrowsException_WhenNotFound() {
        // Arrange
        Long invalidId = 55L;
        when(commentRepository.existsById(invalidId)).thenReturn(false);

        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class, () -> {
            commentService.deleteComment(invalidId);
        });

        assertEquals("Comment not found", exception.getMessage());
        verify(commentRepository, never()).deleteById(anyLong());
    }
}