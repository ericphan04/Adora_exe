package com.adora.service;

import com.adora.dto.CreateReportRequest;
import com.adora.dto.ReportDto;
import com.adora.dto.UserDto;
import com.adora.entity.Report;
import com.adora.entity.ReportStatus;
import com.adora.entity.User;
import com.adora.exception.ResourceNotFoundException;
import com.adora.repository.ReportRepository;
import com.adora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    public ReportDto createReport(CreateReportRequest request, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reporterId));

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .build();

        Report saved = reportRepository.save(report);
        return mapToDto(saved);
    }

    public List<ReportDto> getAllReports(ReportStatus status) {
        List<Report> reports = status != null ? 
                reportRepository.findByStatus(status) : reportRepository.findAll();
        return reports.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ReportDto updateReportStatus(Long id, ReportStatus status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        report.setStatus(status);
        Report saved = reportRepository.save(report);
        return mapToDto(saved);
    }

    private ReportDto mapToDto(Report entity) {
        if (entity == null) return null;
        return ReportDto.builder()
                .id(entity.getId())
                .reporter(entity.getReporter() != null ? 
                        UserDto.builder()
                                .id(entity.getReporter().getId())
                                .fullName(entity.getReporter().getFullName())
                                .email(entity.getReporter().getEmail())
                                .phone(entity.getReporter().getPhone())
                                .role(entity.getReporter().getRole())
                                .status(entity.getReporter().getStatus())
                                .avatarUrl(entity.getReporter().getAvatarUrl())
                                .companyName(entity.getReporter().getCompanyName())
                                .build() : null)
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
