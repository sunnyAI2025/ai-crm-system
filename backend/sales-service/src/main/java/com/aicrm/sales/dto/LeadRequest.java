package com.aicrm.sales.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 线索请求DTO
 * 
 * @author AI CRM Team
 * @since 1.0.0
 */
public class LeadRequest {

    @NotBlank(message = "姓名不能为空")
    @Size(max = 100, message = "姓名长度不能超过100个字符")
    private String name;

    @Size(max = 20, message = "电话号码长度不能超过20个字符")
    private String phone;

    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱长度不能超过100个字符")
    private String email;

    @Size(max = 50, message = "来源长度不能超过50个字符")
    private String source;

    @Size(max = 20, message = "状态长度不能超过20个字符")
    private String status;

    @Size(max = 100, message = "负责人长度不能超过100个字符")
    private String assignedTo;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String notes;

    // 构造函数
    public LeadRequest() {}

    public LeadRequest(String name, String phone, String email, String source, String status, String assignedTo, String notes) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.source = source;
        this.status = status;
        this.assignedTo = assignedTo;
        this.notes = notes;
    }

    // Getter和Setter方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "LeadRequest{" +
                "name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", source='" + source + '\'' +
                ", status='" + status + '\'' +
                ", assignedTo='" + assignedTo + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}
