package com.aicrm.auth.repository;

import com.aicrm.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 用户Repository测试
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("用户Repository测试")
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    private User testUser;
    
    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .password("password123")
                .name("测试用户")
                .phone("13800138000")
                .departmentId(1L)
                .roleId(1L)
                .status(1)
                .build();
    }
    
    @Test
    @DisplayName("保存用户成功")
    void testSaveUser() {
        // When
        User savedUser = userRepository.save(testUser);
        
        // Then
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("testuser");
        assertThat(savedUser.getName()).isEqualTo("测试用户");
        assertThat(savedUser.getCreatedAt()).isNotNull();
        assertThat(savedUser.getUpdatedAt()).isNotNull();
    }
    
    @Test
    @DisplayName("根据用户名查找用户")
    void testFindByUsername() {
        // Given
        userRepository.save(testUser);
        
        // When
        Optional<User> found = userRepository.findByUsername("testuser");
        
        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("testuser");
        assertThat(found.get().getName()).isEqualTo("测试用户");
    }
    
    @Test
    @DisplayName("检查用户名是否存在")
    void testExistsByUsername() {
        // Given
        userRepository.save(testUser);
        
        // When & Then
        assertThat(userRepository.existsByUsername("testuser")).isTrue();
        assertThat(userRepository.existsByUsername("nonexistent")).isFalse();
    }
    
    @Test
    @DisplayName("根据用户名和状态查找用户")
    void testFindByUsernameAndStatus() {
        // Given
        userRepository.save(testUser);
        
        // When
        Optional<User> found = userRepository.findByUsernameAndStatus("testuser", 1);
        Optional<User> notFound = userRepository.findByUsernameAndStatus("testuser", 0);
        
        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(1);
        assertThat(notFound).isEmpty();
    }
    
    @Test
    @DisplayName("检查手机号是否存在")
    void testExistsByPhone() {
        // Given
        userRepository.save(testUser);
        
        // When & Then
        assertThat(userRepository.existsByPhone("13800138000")).isTrue();
        assertThat(userRepository.existsByPhone("13800138001")).isFalse();
    }
}
