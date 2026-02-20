package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    private PostService postService;
    private Post validPost;
    private User validUser;

    @BeforeEach
    void setUp() {
        // Initialize service (Tests the dependency injection logic implicitly)
        postService = new PostService(postRepository);

        // Setup common data
        validUser = new User();
        validUser.setUserId(1L);
        validUser.setUsername("authorUser");

        validPost = new Post();
        validPost.setPostId(100L);
        validPost.setContent("This is a valid post content.");
        validPost.setLikes(5);
    }

    // --- CONSTRUCTOR TEST ---
    @Test
    void testPostServiceConstructor() {
        PostService service = new PostService(postRepository);
        assertNotNull(service, "PostService should be instantiated correctly");
    }

    // --- FUNCTIONALITY TEST 1: Create Post ---
    @Test
    void testCreatePost_Success() {
        // Arrange
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Post createdPost = postService.createPost(validUser, validPost);

        // Assert
        assertNotNull(createdPost);
        assertEquals(validUser, createdPost.getAuthor(), "Author should be set");
        assertEquals(0, createdPost.getLikes(), "Likes should be reset to 0 on creation");
        assertNotNull(createdPost.getTimestamp(), "Timestamp should be set");

        verify(postRepository).save(validPost); // Verify DB save was called
    }

    // --- FUNCTIONALITY TEST 2: Update Post ---
    @Test
    void testUpdatePost_Success() {
        // Arrange
        Long postId = 100L;
        String newContent = "Updated content here";

        when(postRepository.findById(postId)).thenReturn(Optional.of(validPost));
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Post updatedPost = postService.updatePost(postId, newContent);

        // Assert
        assertEquals(newContent, updatedPost.getContent(), "Content should be updated");
        verify(postRepository).save(validPost);
    }

    // --- FUNCTIONALITY TEST 3: Like Post ---
    @Test
    void testLikePost_IncrementsCount() {
        // Arrange
        Long postId = 100L;
        int initialLikes = validPost.getLikes(); // currently 5 from setUp()

        when(postRepository.findById(postId)).thenReturn(Optional.of(validPost));
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Post likedPost = postService.likePost(postId);

        // Assert
        assertEquals(initialLikes + 1, likedPost.getLikes(), "Likes should increment by 1");
        verify(postRepository).save(validPost);
    }

    // --- FUNCTIONALITY TEST 4: Get By Id (Error Case) ---
    @Test
    void testGetById_ThrowsException_WhenNotFound() {
        // Arrange
        Long invalidId = 999L;
        when(postRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class, () -> {
            postService.getById(invalidId);
        });

        assertEquals("Post not found", exception.getMessage());
    }
}