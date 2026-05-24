# Project Guidelines: LED Billboard Rental Marketplace

This document outlines the coding standards, tech stack, and design guidelines for the LED Billboard Rental Marketplace project.

## Tech Stack
* **Frontend**: React + TypeScript + Vite
* **Backend**: Java Spring Boot
* **Database**: PostgreSQL
* **API Style**: RESTful API
* **Authentication**: JWT
* **Roles**: `ADMIN`, `RENTER`, `OWNER`

## General Coding Rules
1. **Clean Code**: Use clean, readable, production-style code.
2. **TypeScript**: Use TypeScript strictly on the frontend.
3. **Backend Architecture**: Use Java Spring Boot layered architecture: Controller, Service, Repository, Entity, DTO.
4. **Database Schema**: Use PostgreSQL-compatible schema.
5. **Naming Consistency**: Keep naming consistent: `User`, `Billboard`, `Booking`, `Payment`, `Review`, `Report`.
6. **API Response**: All APIs must return consistent JSON responses.
7. **Access Control**: Implement role-based access control (RBAC).
8. **Security**: Do not hardcode sensitive information.
9. **Validation & Errors**: Add simple error handling and validation.
10. **MVP First**: Prioritize MVP features first, avoid unnecessary complexity.
11. **Comments**: Write comments only when the logic is important.
12. **UI/UX**: Keep UI clean, modern, responsive, and easy to understand.
13. **System Requirement Specification (SRS)**: Follow the SRS:
    * **Admin**: Manages the platform, users, billboards, bookings, payments, and reports.
    * **Owner**: Posts and manages billboard products/rentals.
    * **Renter**: Searches and books billboard spaces.
