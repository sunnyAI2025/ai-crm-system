package com.aicrm.sales.service;

import com.aicrm.sales.dto.LeadRequest;
import com.aicrm.sales.dto.PageResult;
import com.aicrm.sales.entity.Lead;
import com.aicrm.sales.repository.LeadRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 线索服务层
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@Service
@Transactional
public class LeadService {

    @Autowired
    private LeadRepository leadRepository;

    /**
     * 分页查询线索
     * 
     * @param name 姓名
     * @param phone 电话
     * @param email 邮箱
     * @param source 来源
     * @param status 状态
     * @param assignedTo 负责人
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @param page 页码
     * @param pageSize 页大小
     * @return 分页结果
     */
    @Transactional(readOnly = true)
    public PageResult<Lead> findLeads(String name, String phone, String email, String source, 
                                     String status, String assignedTo, LocalDateTime startDate, 
                                     LocalDateTime endDate, int page, int pageSize) {
        // 创建分页参数
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        
        // 查询数据
        Page<Lead> leadPage = leadRepository.findByConditions(
                name, phone, email, source, status, assignedTo, startDate, endDate, pageable
        );
        
        // 返回结果
        return new PageResult<>(
                leadPage.getContent(),
                leadPage.getTotalElements(),
                page,
                pageSize
        );
    }

    /**
     * 根据ID查询线索
     * 
     * @param id 线索ID
     * @return 线索信息
     */
    @Transactional(readOnly = true)
    public Optional<Lead> findById(Long id) {
        return leadRepository.findById(id);
    }

    /**
     * 创建线索
     * 
     * @param request 线索请求
     * @return 创建的线索
     */
    public Lead createLead(LeadRequest request) {
        Lead lead = new Lead();
        BeanUtils.copyProperties(request, lead);
        
        // 设置默认状态
        if (lead.getStatus() == null || lead.getStatus().isEmpty()) {
            lead.setStatus("待跟进");
        }
        
        return leadRepository.save(lead);
    }

    /**
     * 更新线索
     * 
     * @param id 线索ID
     * @param request 线索请求
     * @return 更新后的线索
     */
    public Lead updateLead(Long id, LeadRequest request) {
        Optional<Lead> leadOpt = leadRepository.findById(id);
        if (leadOpt.isEmpty()) {
            throw new RuntimeException("线索不存在");
        }
        
        Lead lead = leadOpt.get();
        BeanUtils.copyProperties(request, lead);
        
        return leadRepository.save(lead);
    }

    /**
     * 删除线索
     * 
     * @param id 线索ID
     */
    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new RuntimeException("线索不存在");
        }
        
        leadRepository.deleteById(id);
    }

    /**
     * 获取线索统计信息
     * 
     * @return 统计信息
     */
    @Transactional(readOnly = true)
    public LeadStatistics getStatistics() {
        long totalCount = leadRepository.count();
        long pendingCount = leadRepository.countByStatus("待跟进");
        long contactedCount = leadRepository.countByStatus("已联系");
        long convertedCount = leadRepository.countByStatus("已转化");
        
        return new LeadStatistics(totalCount, pendingCount, contactedCount, convertedCount);
    }

    /**
     * 线索统计信息内部类
     */
    public static class LeadStatistics {
        private long totalCount;
        private long pendingCount;
        private long contactedCount;
        private long convertedCount;

        public LeadStatistics(long totalCount, long pendingCount, long contactedCount, long convertedCount) {
            this.totalCount = totalCount;
            this.pendingCount = pendingCount;
            this.contactedCount = contactedCount;
            this.convertedCount = convertedCount;
        }

        // Getter方法
        public long getTotalCount() { return totalCount; }
        public long getPendingCount() { return pendingCount; }
        public long getContactedCount() { return contactedCount; }
        public long getConvertedCount() { return convertedCount; }
    }
}
