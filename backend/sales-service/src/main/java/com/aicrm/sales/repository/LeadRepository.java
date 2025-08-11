package com.aicrm.sales.repository;

import com.aicrm.sales.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * 线索数据访问层
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    /**
     * 根据条件分页查询线索
     * 
     * @param name 姓名（模糊查询）
     * @param phone 电话（模糊查询）
     * @param email 邮箱（模糊查询）
     * @param source 来源
     * @param status 状态
     * @param assignedTo 负责人（模糊查询）
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT l FROM Lead l WHERE " +
           "(:name IS NULL OR l.name LIKE %:name%) AND " +
           "(:phone IS NULL OR l.phone LIKE %:phone%) AND " +
           "(:email IS NULL OR l.email LIKE %:email%) AND " +
           "(:source IS NULL OR l.source = :source) AND " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:assignedTo IS NULL OR l.assignedTo LIKE %:assignedTo%) AND " +
           "(:startDate IS NULL OR l.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR l.createdAt <= :endDate) " +
           "ORDER BY l.createdAt DESC")
    Page<Lead> findByConditions(
            @Param("name") String name,
            @Param("phone") String phone,
            @Param("email") String email,
            @Param("source") String source,
            @Param("status") String status,
            @Param("assignedTo") String assignedTo,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 根据负责人查询线索数量
     * 
     * @param assignedTo 负责人
     * @return 线索数量
     */
    long countByAssignedTo(String assignedTo);

    /**
     * 根据状态查询线索数量
     * 
     * @param status 状态
     * @return 线索数量
     */
    long countByStatus(String status);

    /**
     * 根据来源查询线索数量
     * 
     * @param source 来源
     * @return 线索数量
     */
    long countBySource(String source);
}
