package com.aicrm.sales.controller;

import com.aicrm.sales.dto.ApiResponse;
import com.aicrm.sales.dto.LeadRequest;
import com.aicrm.sales.dto.PageResult;
import com.aicrm.sales.entity.Lead;
import com.aicrm.sales.service.LeadService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * 线索管理控制器
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    private static final Logger logger = LoggerFactory.getLogger(LeadController.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private LeadService leadService;

    /**
     * 分页查询线索
     * 
     * @param name 姓名（可选）
     * @param phone 电话（可选）
     * @param email 邮箱（可选）
     * @param source 来源（可选）
     * @param status 状态（可选）
     * @param assignedTo 负责人（可选）
     * @param startDate 开始时间（可选）
     * @param endDate 结束时间（可选）
     * @param page 页码（默认1）
     * @param pageSize 页大小（默认10）
     * @return 分页结果
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResult<Lead>>> getLeads(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        try {
            logger.info("查询线索列表 - 参数: name={}, phone={}, email={}, source={}, status={}, assignedTo={}, startDate={}, endDate={}, page={}, pageSize={}",
                    name, phone, email, source, status, assignedTo, startDate, endDate, page, pageSize);

            // 转换时间参数
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            if (startDate != null && !startDate.isEmpty()) {
                startDateTime = LocalDateTime.parse(startDate + " 00:00:00", DATE_TIME_FORMATTER);
            }
            if (endDate != null && !endDate.isEmpty()) {
                endDateTime = LocalDateTime.parse(endDate + " 23:59:59", DATE_TIME_FORMATTER);
            }

            // 查询数据
            PageResult<Lead> result = leadService.findLeads(
                    name, phone, email, source, status, assignedTo, 
                    startDateTime, endDateTime, page, pageSize
            );

            logger.info("查询线索列表成功 - 总数: {}, 当前页: {}", result.getTotal(), result.getPage());
            return ResponseEntity.ok(ApiResponse.success("查询成功", result));

        } catch (Exception e) {
            logger.error("查询线索列表失败", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("查询失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID查询线索
     * 
     * @param id 线索ID
     * @return 线索信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Lead>> getLeadById(@PathVariable Long id) {
        try {
            logger.info("查询线索详情 - ID: {}", id);

            Optional<Lead> leadOpt = leadService.findById(id);
            if (leadOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            logger.info("查询线索详情成功 - ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("查询成功", leadOpt.get()));

        } catch (Exception e) {
            logger.error("查询线索详情失败 - ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("查询失败: " + e.getMessage()));
        }
    }

    /**
     * 创建线索
     * 
     * @param request 线索请求
     * @return 创建的线索
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Lead>> createLead(@Valid @RequestBody LeadRequest request) {
        try {
            logger.info("创建线索 - 数据: {}", request);

            Lead lead = leadService.createLead(request);

            logger.info("创建线索成功 - ID: {}", lead.getId());
            return ResponseEntity.ok(ApiResponse.success("线索创建成功", lead));

        } catch (Exception e) {
            logger.error("创建线索失败", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("创建失败: " + e.getMessage()));
        }
    }

    /**
     * 更新线索
     * 
     * @param id 线索ID
     * @param request 线索请求
     * @return 更新后的线索
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Lead>> updateLead(@PathVariable Long id, 
                                                       @Valid @RequestBody LeadRequest request) {
        try {
            logger.info("更新线索 - ID: {}, 数据: {}", id, request);

            Lead lead = leadService.updateLead(id, request);

            logger.info("更新线索成功 - ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("线索更新成功", lead));

        } catch (RuntimeException e) {
            logger.warn("更新线索失败 - ID: {}, 原因: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("更新线索失败 - ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("更新失败: " + e.getMessage()));
        }
    }

    /**
     * 删除线索
     * 
     * @param id 线索ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable Long id) {
        try {
            logger.info("删除线索 - ID: {}", id);

            leadService.deleteLead(id);

            logger.info("删除线索成功 - ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("线索删除成功", null));

        } catch (RuntimeException e) {
            logger.warn("删除线索失败 - ID: {}, 原因: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("删除线索失败 - ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("删除失败: " + e.getMessage()));
        }
    }

    /**
     * 获取线索统计信息
     * 
     * @return 统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<LeadService.LeadStatistics>> getStatistics() {
        try {
            logger.info("获取线索统计信息");

            LeadService.LeadStatistics statistics = leadService.getStatistics();

            logger.info("获取线索统计信息成功");
            return ResponseEntity.ok(ApiResponse.success("查询成功", statistics));

        } catch (Exception e) {
            logger.error("获取线索统计信息失败", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("查询失败: " + e.getMessage()));
        }
    }
}
