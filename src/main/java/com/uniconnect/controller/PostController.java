package com.uniconnect.controller;

import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.UserRepository;
import com.uniconnect.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;

    public PostController(PostService postService,
                          UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Post> getAll() {
        return postService.getAll();
    }

    @GetMapping("/{id}")
    public Post getById(@PathVariable Long id) {
        return postService.getById(id);
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post, Authentication auth) {
        // 1. VALIDARE: Verificăm dacă titlul sau conținutul lipsesc
        // Spring a pus deja datele din JSON în obiectul 'post'
        if (post.getTitle() == null || post.getTitle().trim().isEmpty() ||
                post.getContent() == null || post.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title and Content are required!");
        }

        // 2. Aflăm cine este userul
        String email = auth.getName();
        User author = userRepository.findByEmail(email).orElseThrow();

        // 3. Apelăm Service-ul tău (care e mult mai elegant)
        return ResponseEntity.ok(postService.createPost(author, post));
    }

// ... în interiorul clasei PostController ...

    @PostMapping("/{id}/like")
    public ResponseEntity<?> like(@PathVariable Long id, Authentication auth) {
        try {
            String email = auth.getName(); // Cine e logat?

            // Apelăm metoda nouă din service
            Post updatedPost = postService.likePost(id, email);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            // Trimitem mesajul de eroare (ex: "You cannot like your own post!")
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        // Căutăm postarea
        Post post = postService.getById(id);

        // VERIFICARE CRITICĂ: Ești tu autorul?
        if (!post.getAuthor().getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(403).body("You can only delete your own posts");
        }

        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

}
