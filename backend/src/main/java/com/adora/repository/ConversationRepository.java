package com.adora.repository;

import com.adora.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.renter.id = :userId OR c.owner.id = :userId ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    List<Conversation> findForRenterOrOwner(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    List<Conversation> findAllForAdmin();

    List<Conversation> findByBillboardId(Long billboardId);

    Optional<Conversation> findByRenterIdAndOwnerIdAndBookingId(Long renterId, Long ownerId, Long bookingId);

    Optional<Conversation> findByRenterIdAndOwnerIdAndBookingIsNullAndBillboardId(Long renterId, Long ownerId, Long billboardId);

    Optional<Conversation> findByRenterIdAndOwnerIdAndBookingIsNullAndBillboardIsNull(Long renterId, Long ownerId);
}
