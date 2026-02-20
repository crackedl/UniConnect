package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.PostRepository;
import com.uniconnect.repository.UserRepository; // <--- Import NOU
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository; // <--- Câmp NOU

    // Injectăm UserRepository în constructor
    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Post createPost(User author, Post post) {
        if (post.getContent() == null || post.getContent().trim().isEmpty()) {
            throw new InvalidInputException("Post content cannot be empty");
        }
        post.setAuthor(author);
        post.setTimestamp(LocalDateTime.now());
        // Nu mai setăm likes = 0 manual, Set-ul e gol implicit

        if (post.getFaculty() == null || post.getFaculty().isEmpty()) {
            post.setFaculty(author.getFaculty());
        }
        if (post.getDepartment() == null || post.getDepartment().isEmpty()) {
            post.setDepartment(author.getDepartment());
        }

        return postRepository.save(post);
    }

    // --- METODĂ NOUĂ DE LIKE ---
    // Acceptă acum și email-ul userului care dă like
    public Post likePost(Long id, String userEmail) {
        Post post = getById(id);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        // 1. REGULA: Nu poți da like la propria postare
        if (post.getAuthor().getUserId().equals(currentUser.getUserId())) {
            throw new InvalidInputException("You cannot like your own post!");
        }

        // 2. TOGGLE: Dacă ai dat deja like, îl scoatem. Dacă nu, îl punem.
        if (post.getLikedByUsers().contains(currentUser)) {
            post.getLikedByUsers().remove(currentUser); // Unlike
        } else {
            post.getLikedByUsers().add(currentUser); // Like
        }

        return postRepository.save(post);
    }

    // Restul metodelor rămân la fel
    public List<Post> getAll() { return postRepository.findAllByOrderByTimestampDesc(); }
    public Post getById(Long id) { return postRepository.findById(id).orElseThrow(() -> new InvalidInputException("Post not found")); }
    public List<Post> getByAuthor(User author) { return postRepository.findByAuthor(author); }
    public List<Post> search(String keyword) { return postRepository.findByContentContainingIgnoreCase(keyword); }
    public List<Post> getByFaculty(String faculty) { return postRepository.findByFacultyOrderByTimestampDesc(faculty); }
    public List<Post> getByDepartment(String department) { return postRepository.findByDepartment(department); }
    public List<Post> getByFacultyAndDepartment(String f, String d) { return postRepository.findByFacultyAndDepartment(f, d); }
    public void deletePost(Long id) { postRepository.deleteById(id); }
}