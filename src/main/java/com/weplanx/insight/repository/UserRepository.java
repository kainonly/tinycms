package com.weplanx.insight.repository;

import com.weplanx.insight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
