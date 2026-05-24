package com.adora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "billboard_features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillboardFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billboard_id", nullable = false)
    private Billboard billboard;

    @Column(nullable = false)
    private String name;
}
