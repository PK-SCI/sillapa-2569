/**
 * PK Junior NACC - OBEC (ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว)
 * File: js/pages.js
 * Description: SPA Page Renderers for all content pages
 */

// Global namespace setup
window.PKApp = window.PKApp || {};
PKApp.pages = PKApp.pages || {};

(function() {
    'use strict';

    // =========================================================================
    // CSS Styles Injection for Components
    // Ensures org-chart, timeline, data-table, carousels, and cards render beautifully
    // =========================================================================
    function ensureComponentStyles() {
        if (document.getElementById('pk-pages-styles')) return;

        var style = document.createElement('style');
        style.id = 'pk-pages-styles';
        style.textContent = `
            /* Container & Layout */
            .page-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1.5rem 1rem 3rem 1rem;
                font-family: 'Prompt', sans-serif;
            }
            .page-header {
                margin-bottom: 2rem;
                text-align: center;
                position: relative;
            }
            .page-header-title {
                font-size: 1.875rem;
                font-weight: 700;
                color: #581c87;
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.5rem;
            }
            .page-header-subtitle {
                font-size: 1rem;
                color: #6b7280;
                font-weight: 400;
            }
            .page-header-divider {
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #6b21a8, #d4a843);
                border-radius: 9999px;
                margin: 0.75rem auto 0 auto;
            }

            /* Loading & Error & Empty States */
            .loading-spinner {
                display: inline-block;
                width: 44px;
                height: 44px;
                border: 4px solid #ddd6fe;
                border-top-color: #6b21a8;
                border-radius: 50%;
                animation: pk-spin 0.8s linear infinite;
            }
            @keyframes pk-spin {
                to { transform: rotate(360deg); }
            }
            .page-loading-wrapper {
                min-height: 350px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                color: #6b21a8;
                font-weight: 500;
            }
            .error-message {
                max-width: 600px;
                margin: 2rem auto;
                padding: 1.5rem 2rem;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 1rem;
                color: #991b1b;
                text-align: center;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
            }
            .empty-state {
                text-align: center;
                padding: 3.5rem 1.5rem;
                background: #ffffff;
                border: 2px dashed #e9d5ff;
                border-radius: 1.25rem;
                color: #6b7280;
                margin: 1.5rem 0;
            }
            .empty-state-icon {
                width: 64px;
                height: 64px;
                color: #c084fc;
                margin: 0 auto 1rem auto;
            }

            /* Filter & Control Bar */
            .page-controls-bar {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1.5rem;
                background: #faf5ff;
                padding: 1rem 1.25rem;
                border-radius: 1rem;
                border: 1px solid #f3e8ff;
            }
            .page-search-input {
                flex: 1;
                min-width: 240px;
                max-width: 400px;
                padding: 0.625rem 1rem 0.625rem 2.5rem;
                border: 1px solid #d8b4fe;
                border-radius: 0.75rem;
                font-family: inherit;
                font-size: 0.9375rem;
                background-color: #ffffff;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239333ea'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: 0.75rem center;
                background-size: 1.125rem;
            }
            .page-search-input:focus {
                outline: none;
                border-color: #7e22ce;
                box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
            }
            .page-select {
                padding: 0.625rem 2.25rem 0.625rem 1rem;
                border: 1px solid #d8b4fe;
                border-radius: 0.75rem;
                font-family: inherit;
                font-size: 0.9375rem;
                background-color: #ffffff;
                color: #581c87;
                font-weight: 500;
                cursor: pointer;
            }

            /* Buttons & Badges */
            .pk-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 500;
                font-family: inherit;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }
            .pk-btn-primary {
                background: linear-gradient(135deg, #6b21a8, #7e22ce);
                color: #ffffff;
                box-shadow: 0 4px 10px rgba(107, 33, 168, 0.2);
            }
            .pk-btn-primary:hover {
                background: linear-gradient(135deg, #581c87, #6b21a8);
                transform: translateY(-1px);
                box-shadow: 0 6px 14px rgba(107, 33, 168, 0.28);
                color: #ffffff;
            }
            .pk-btn-secondary {
                background: #f3e8ff;
                color: #6b21a8;
                border: 1px solid #e9d5ff;
            }
            .pk-btn-secondary:hover {
                background: #e9d5ff;
                color: #581c87;
            }
            .pk-btn-gold {
                background: linear-gradient(135deg, #d4a843, #b88b28);
                color: #ffffff;
                box-shadow: 0 4px 10px rgba(212, 168, 67, 0.2);
            }
            .pk-btn-gold:hover {
                background: linear-gradient(135deg, #b88b28, #997017);
                color: #ffffff;
                transform: translateY(-1px);
            }
            .pk-btn-sm {
                padding: 0.375rem 0.75rem;
                font-size: 0.8125rem;
                border-radius: 0.5rem;
            }
            .pk-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                padding: 0.25rem 0.625rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .pk-badge-purple {
                background: #f3e8ff;
                color: #6b21a8;
                border: 1px solid #e9d5ff;
            }
            .pk-badge-gold {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }

            /* Rich Content Block */
            .rich-content-card {
                background: #ffffff;
                border-radius: 1.25rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                border: 1px solid #f3e8ff;
                overflow: hidden;
                margin-bottom: 2rem;
            }
            .rich-content-header {
                padding: 1.5rem 2rem;
                background: linear-gradient(135deg, #faf5ff, #ffffff);
                border-bottom: 1px solid #f3e8ff;
            }
            .rich-content-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #581c87;
                margin: 0;
            }
            .rich-content-body {
                padding: 2rem;
                font-size: 1.0625rem;
                line-height: 1.8;
                color: #374151;
            }
            .rich-content-body p {
                margin-bottom: 1.25rem;
            }
            .rich-content-body img {
                max-width: 100%;
                height: auto;
                border-radius: 0.75rem;
                margin: 1.5rem auto;
                display: block;
                box-shadow: 0 4px 14px rgba(0,0,0,0.08);
            }
            .rich-content-media {
                padding: 0 2rem 2rem 2rem;
            }

            /* Embedded PDF Viewer */
            .pdf-embed-wrapper {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 1rem;
                padding: 1rem;
                margin: 1.5rem 0;
            }
            .pdf-embed-frame {
                width: 100%;
                height: 640px;
                border: none;
                border-radius: 0.75rem;
                background: #ffffff;
            }
            .pdf-embed-footer {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                margin-top: 0.75rem;
                padding: 0.5rem 0.25rem 0 0.25rem;
            }

            /* Data Table */
            .table-responsive {
                width: 100%;
                overflow-x: auto;
                background: #ffffff;
                border-radius: 1rem;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
                border: 1px solid #f3e8ff;
                margin-bottom: 2rem;
                -webkit-overflow-scrolling: touch;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.9375rem;
            }
            .data-table th {
                background: linear-gradient(135deg, #6b21a8, #7e22ce);
                color: #ffffff;
                padding: 1rem 1.25rem;
                font-weight: 600;
                white-space: nowrap;
            }
            .data-table td {
                padding: 1rem 1.25rem;
                border-bottom: 1px solid #f3e8ff;
                color: #374151;
            }
            .data-table tr:last-child td {
                border-bottom: none;
            }
            .data-table tr:hover td {
                background-color: #faf5ff;
            }
            .data-table td.text-center, .data-table th.text-center {
                text-align: center;
            }

            /* Org Chart */
            .org-chart {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
                padding: 1rem 0 3rem 0;
                width: 100%;
                overflow-x: auto;
            }
            .org-level {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            .org-level-badge {
                display: inline-block;
                padding: 0.25rem 1rem;
                background: #f3e8ff;
                color: #7e22ce;
                font-size: 0.8125rem;
                font-weight: 600;
                border-radius: 9999px;
                border: 1px solid #e9d5ff;
                margin-bottom: 1rem;
            }
            .org-cards-row {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 1.25rem;
                width: 100%;
                max-width: 1100px;
            }
            .org-card {
                background: #ffffff;
                border-radius: 1.25rem;
                padding: 1.5rem 1.25rem;
                width: 220px;
                text-align: center;
                box-shadow: 0 4px 16px rgba(107, 33, 168, 0.08);
                border: 2px solid #f3e8ff;
                position: relative;
                transition: all 0.25s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .org-card:hover {
                transform: translateY(-4px);
                border-color: #c084fc;
                box-shadow: 0 10px 24px rgba(107, 33, 168, 0.16);
            }
            .org-card.org-card-top {
                width: 260px;
                border-color: #d4a843;
                background: linear-gradient(180deg, #fffbeb, #ffffff);
            }
            .org-avatar-wrap {
                width: 84px;
                height: 84px;
                border-radius: 50%;
                overflow: hidden;
                margin-bottom: 0.875rem;
                border: 3px solid #d4a843;
                box-shadow: 0 3px 8px rgba(0,0,0,0.1);
                background: #f3e8ff;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .org-card.org-card-top .org-avatar-wrap {
                width: 96px;
                height: 96px;
                border-width: 4px;
            }
            .org-avatar {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .org-name {
                font-size: 1rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 0.25rem 0;
                line-height: 1.4;
            }
            .org-position {
                font-size: 0.8125rem;
                font-weight: 500;
                color: #7e22ce;
                margin: 0 0 0.375rem 0;
            }
            .org-class {
                font-size: 0.75rem;
                background: #fef3c7;
                color: #92400e;
                padding: 0.125rem 0.5rem;
                border-radius: 9999px;
                display: inline-block;
                font-weight: 600;
            }
            .org-line {
                width: 2px;
                height: 28px;
                background: linear-gradient(180deg, #c084fc, #d4a843);
                margin: 0.25rem auto;
            }

            /* News Cards Grid */
            .news-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
                gap: 1.75rem;
                margin-bottom: 2.5rem;
            }
            .news-card {
                background: #ffffff;
                border-radius: 1.25rem;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                border: 1px solid #f3e8ff;
                display: flex;
                flex-direction: column;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
                color: inherit;
                cursor: pointer;
            }
            .news-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 28px rgba(107, 33, 168, 0.14);
                border-color: #d8b4fe;
            }
            .news-card-img-wrap {
                width: 100%;
                height: 200px;
                background: #f3e8ff;
                position: relative;
                overflow: hidden;
            }
            .news-card-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
            }
            .news-card:hover .news-card-img {
                transform: scale(1.05);
            }
            .news-card-img-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
                color: #7e22ce;
            }
            .news-card-type-tag {
                position: absolute;
                top: 0.875rem;
                left: 0.875rem;
                background: rgba(107, 33, 168, 0.9);
                backdrop-filter: blur(4px);
                color: #ffffff;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .news-card-body {
                padding: 1.25rem;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .news-card-title {
                font-size: 1.0625rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 0.75rem 0;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .news-card-meta {
                margin-top: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.8125rem;
                color: #6b7280;
                padding-top: 0.75rem;
                border-top: 1px solid #f3e8ff;
            }

            /* Pagination */
            .pagination-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.5rem;
                margin: 2rem 0;
            }
            .page-btn {
                padding: 0.5rem 0.875rem;
                border-radius: 0.625rem;
                border: 1px solid #e9d5ff;
                background: #ffffff;
                color: #6b21a8;
                font-family: inherit;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .page-btn:hover:not(:disabled) {
                background: #f3e8ff;
                border-color: #c084fc;
            }
            .page-btn.active {
                background: #6b21a8;
                color: #ffffff;
                border-color: #6b21a8;
                font-weight: 600;
            }
            .page-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            /* News Detail Page */
            .news-detail-wrapper {
                background: #ffffff;
                border-radius: 1.5rem;
                padding: 2.25rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                border: 1px solid #f3e8ff;
            }
            .news-detail-header {
                margin-bottom: 2rem;
                border-bottom: 1px solid #f3e8ff;
                padding-bottom: 1.5rem;
            }
            .news-detail-meta {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
                font-size: 0.875rem;
                color: #6b7280;
            }
            .news-detail-title {
                font-size: 1.875rem;
                font-weight: 700;
                color: #581c87;
                line-height: 1.4;
            }
            .news-detail-content {
                font-size: 1.0625rem;
                line-height: 1.8;
                color: #374151;
                margin-bottom: 2rem;
            }
            .news-attachments-section {
                margin-top: 2.5rem;
                padding-top: 1.5rem;
                border-top: 2px dashed #f3e8ff;
            }
            .news-attachments-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #6b21a8;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            /* Awards Cards & Carousels */
            .award-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                gap: 1.75rem;
                margin-bottom: 2.5rem;
            }
            .award-card {
                background: #ffffff;
                border-radius: 1.25rem;
                overflow: hidden;
                box-shadow: 0 4px 18px rgba(0,0,0,0.06);
                border: 1px solid #f3e8ff;
                display: flex;
                flex-direction: column;
                transition: transform 0.25s, box-shadow 0.25s;
            }
            .award-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 24px rgba(107, 33, 168, 0.12);
            }
            .award-carousel {
                position: relative;
                width: 100%;
                height: 230px;
                background: #1f2937;
                overflow: hidden;
            }
            .award-carousel-slides {
                width: 100%;
                height: 100%;
                position: relative;
            }
            .award-carousel-slide {
                position: absolute;
                inset: 0;
                opacity: 0;
                transition: opacity 0.4s ease-in-out;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .award-carousel-slide.active {
                opacity: 1;
            }
            .award-carousel-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .carousel-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(4px);
                color: #ffffff;
                border: none;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.25rem;
                z-index: 2;
                transition: background 0.2s;
            }
            .carousel-btn:hover {
                background: rgba(107, 33, 168, 0.85);
            }
            .carousel-btn.prev { left: 8px; }
            .carousel-btn.next { right: 8px; }
            .carousel-dots {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 6px;
                z-index: 2;
            }
            .carousel-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                transition: all 0.2s;
            }
            .carousel-dot.active {
                background: #d4a843;
                width: 20px;
                border-radius: 9999px;
            }
            .carousel-counter {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0,0,0,0.6);
                color: #fff;
                font-size: 0.75rem;
                padding: 2px 8px;
                border-radius: 9999px;
                z-index: 2;
            }
            .award-card-body {
                padding: 1.25rem;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .award-badges-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
            }
            .medal-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.8125rem;
                font-weight: 600;
            }
            .medal-gold {
                background: linear-gradient(135deg, #fef3c7, #fde68a);
                color: #92400e;
                border: 1px solid #fcd34d;
            }
            .medal-silver {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                color: #334155;
                border: 1px solid #cbd5e1;
            }
            .medal-bronze {
                background: linear-gradient(135deg, #ffedd5, #fed7aa);
                color: #9a3412;
                border: 1px solid #fdba74;
            }
            .award-work-name {
                font-size: 1.125rem;
                font-weight: 700;
                color: #581c87;
                margin: 0 0 0.75rem 0;
                line-height: 1.4;
            }
            .award-info-list {
                margin: 0;
                padding: 0;
                list-style: none;
                font-size: 0.875rem;
                color: #4b5563;
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
            }
            .award-info-item {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
            }
            .award-info-label {
                font-weight: 600;
                color: #6b7280;
                min-width: 80px;
                flex-shrink: 0;
            }

            /* Timeline for Project Plans */
            .plan-card {
                background: #ffffff;
                border-radius: 1.25rem;
                padding: 1.75rem;
                margin-bottom: 1.75rem;
                border: 1px solid #f3e8ff;
                box-shadow: 0 4px 16px rgba(0,0,0,0.05);
            }
            .plan-header {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .plan-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #581c87;
                margin: 0 0 0.25rem 0;
            }
            .plan-meta {
                font-size: 0.875rem;
                color: #6b7280;
            }
            .timeline {
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                margin: 2rem 0;
                padding: 0 1rem;
            }
            .timeline-track {
                position: absolute;
                top: 20px;
                left: 3rem;
                right: 3rem;
                height: 4px;
                background: #e5e7eb;
                z-index: 1;
            }
            .timeline-step {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                min-width: 80px;
            }
            .timeline-step-circle {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #ffffff;
                border: 3px solid #d1d5db;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.875rem;
                color: #9ca3af;
                transition: all 0.3s;
            }
            .timeline-step.completed .timeline-step-circle {
                background: #10b981;
                border-color: #10b981;
                color: #ffffff;
            }
            .timeline-step.active .timeline-step-circle {
                background: #6b21a8;
                border-color: #d4a843;
                color: #ffffff;
                box-shadow: 0 0 0 4px rgba(212, 168, 67, 0.25);
            }
            .timeline-step.failed .timeline-step-circle {
                background: #ef4444;
                border-color: #ef4444;
                color: #ffffff;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
            }
            .timeline-step.disabled .timeline-step-circle {
                background: #f3f4f6;
                border-color: #e5e7eb;
                color: #d1d5db;
                opacity: 0.6;
            }
            .timeline-step-label {
                font-size: 0.8125rem;
                font-weight: 600;
                color: #6b7280;
                text-align: center;
            }
            .timeline-step.active .timeline-step-label {
                color: #6b21a8;
                font-weight: 700;
            }
            .timeline-step.failed .timeline-step-label {
                color: #ef4444;
                font-weight: 700;
            }
            .timeline-step.disabled .timeline-step-label {
                color: #9ca3af;
                opacity: 0.6;
            }

            /* Coming Soon Box */
            .coming-soon-card {
                background: #ffffff;
                border-radius: 1.5rem;
                padding: 4rem 2rem;
                text-align: center;
                max-width: 600px;
                margin: 2rem auto;
                box-shadow: 0 6px 24px rgba(107, 33, 168, 0.08);
                border: 2px dashed #d8b4fe;
            }
            .coming-soon-icon-wrap {
                width: 90px;
                height: 90px;
                background: linear-gradient(135deg, #f3e8ff, #fef3c7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem auto;
                color: #6b21a8;
            }

            /* Responsive Adjustments */
            @media (max-width: 768px) {
                .page-content {
                    padding: 1rem 0.75rem 2rem 0.75rem;
                }
                .page-header-title {
                    font-size: 1.5rem;
                }
                .rich-content-body {
                    padding: 1.25rem;
                }
                .rich-content-header {
                    padding: 1.25rem;
                }
                .pdf-embed-frame {
                    height: 420px;
                }
                .timeline {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1.5rem;
                    padding-left: 2rem;
                }
                .timeline-track {
                    top: 1rem;
                    bottom: 1rem;
                    left: 2rem;
                    width: 4px;
                    height: auto;
                    right: auto;
                }
                .timeline-step {
                    flex-direction: row;
                    min-width: unset;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // Core Helper Functions
    // =========================================================================

    /**
     * Get or initialize Supabase client instance
     */
    function getSupabase() {
        if (PKApp.supabase) return PKApp.supabase;
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            PKApp.supabase = supabase.createClient(PKApp.SUPABASE_URL, PKApp.SUPABASE_KEY);
            return PKApp.supabase;
        }
        return null;
    }

    /**
     * Get target main content container
     */
    function getContainer() {
        return document.getElementById('app-content');
    }

    /**
     * Render standard loading spinner into container
     */
    function renderLoading(container, text) {
        text = text || 'กำลังโหลดข้อมูล...';
        container.innerHTML = `
            <div class="page-loading-wrapper">
                <div class="loading-spinner"></div>
                <div>${PKApp.escapeHtml ? PKApp.escapeHtml(text) : text}</div>
            </div>
        `;
    }

    /**
     * Render standard error state
     */
    function renderError(container, message) {
        message = message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง';
        container.innerHTML = `
            <div class="page-content">
                <div class="error-message">
                    <svg style="width:36px;height:36px;margin:0 auto 0.5rem auto;display:block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                        <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
                    </svg>
                    <p style="font-weight:600;margin:0 0 0.5rem 0;">ขออภัย</p>
                    <p style="margin:0;">${PKApp.escapeHtml ? PKApp.escapeHtml(message) : message}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state box
     */
    function renderEmpty(text) {
        text = text || 'ไม่พบข้อมูล';
        return `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p style="font-size:1.125rem;font-weight:500;margin:0;">${PKApp.escapeHtml ? PKApp.escapeHtml(text) : text}</p>
            </div>
        `;
    }

    /**
     * Escape string safe helper
     */
    function esc(str) {
        if (PKApp.escapeHtml) return PKApp.escapeHtml(str);
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Format date using PKApp helper or standard Thai formatting
     */
    function formatDate(dateStr, includeTime) {
        if (!dateStr) return '-';
        if (PKApp.formatThaiDate) {
            return PKApp.formatThaiDate(dateStr, includeTime);
        }
        return String(dateStr);
    }

    /**
     * Format date only (no time)
     */
    function formatDateOnly(dateStr) {
        if (!dateStr) return '-';
        if (PKApp.formatThaiDateOnly) {
            return PKApp.formatThaiDateOnly(dateStr);
        }
        return formatDate(dateStr, false);
    }

    /**
     * Parse comma-separated or single URLs into clean array
     */
    function parseUrls(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
        return String(val)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }

    /**
     * Check if a URL or string references a PDF
     */
    function isPdfUrl(url) {
        if (!url) return false;
        var lower = String(url).toLowerCase();
        return lower.indexOf('.pdf') !== -1 || lower.indexOf('/pdf') !== -1 || lower.indexOf('pdf') !== -1 && lower.indexOf('drive.google.com') !== -1;
    }

    /**
     * Extract Google Drive ID if present
     */
    function extractGoogleDriveId(url) {
        if (!url) return null;
        var str = String(url).trim();
        if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) {
            return str;
        }
        var match = str.match(/\/d\/([a-zA-Z0-9_-]+)/) || str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    /**
     * Get preview & direct download links for any file
     */
    function getFileLinkDetails(rawUrl) {
        if (!rawUrl) return null;
        var str = String(rawUrl).trim();
        var driveId = extractGoogleDriveId(str);

        if (driveId) {
            return {
                isDrive: true,
                driveId: driveId,
                previewUrl: 'https://drive.google.com/file/d/' + driveId + '/preview',
                downloadUrl: 'https://drive.google.com/uc?export=download&id=' + driveId,
                imageUrl: 'https://lh3.googleusercontent.com/d/' + driveId
            };
        }

        return {
            isDrive: false,
            driveId: null,
            previewUrl: str,
            downloadUrl: str,
            imageUrl: str
        };
    }

    /**
     * Render an embedded PDF viewer with fallback download button
     */
    function renderPdfViewerHtml(url, title) {
        var info = getFileLinkDetails(url);
        if (!info) return '';

        var embedSrc = info.isDrive ? info.previewUrl : info.downloadUrl;
        var downloadHref = info.downloadUrl;

        return `
            <div class="pdf-embed-wrapper">
                <iframe src="${embedSrc}" class="pdf-embed-frame" title="${esc(title || 'เอกสาร PDF')}"></iframe>
                <div class="pdf-embed-footer">
                    <span style="font-size:0.875rem;color:#6b7280;">
                        <svg style="width:18px;height:18px;vertical-align:text-bottom;margin-right:4px;display:inline-block;color:#ef4444;" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                        </svg>
                        เอกสารประกอบ (PDF)
                    </span>
                    <a href="${downloadHref}" target="_blank" rel="noopener noreferrer" class="pk-btn pk-btn-primary pk-btn-sm">
                        <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        ดาวน์โหลด / เปิดในหน้าต่างใหม่
                    </a>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // Generic Rich Content Page Helper (significance, hoop, anthority)
    // =========================================================================
    async function renderRichContentPage(tableName, pageTitle) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลด ' + pageTitle + '...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            // First attempt to query ordered by sort_order
            var query = sb.from(tableName).select('*');
            var result = await query.order('sort_order', { ascending: true });

            // Fallback if sort_order column doesn't exist
            if (result.error && result.error.message && result.error.message.indexOf('sort_order') !== -1) {
                result = await sb.from(tableName).select('*');
            }

            if (result.error) {
                console.error('Error fetching ' + tableName + ':', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดเนื้อหา: ' + (result.error.message || ''));
                return;
            }

            var items = result.data || [];

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            ${esc(pageTitle)}
                        </h1>
                        <p class="page-header-subtitle">ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</p>
                        <div class="page-header-divider"></div>
                    </div>
            `;

            if (items.length === 0) {
                html += renderEmpty('ยังไม่มีข้อมูล ' + pageTitle);
            } else {
                items.forEach(function(item) {
                    var title = item.title || item.name || '';
                    var contentHtml = item.mag || item.content || item.detail || '';
                    var urls = parseUrls(item.url || item.file_url || '');

                    html += `
                        <article class="rich-content-card">
                            ${title ? `
                                <div class="rich-content-header">
                                    <h2 class="rich-content-title">${esc(title)}</h2>
                                </div>
                            ` : ''}
                            
                            ${contentHtml ? `
                                <div class="rich-content-body">
                                    ${contentHtml}
                                </div>
                            ` : ''}

                            ${urls.length > 0 ? `
                                <div class="rich-content-media">
                                    ${urls.map(function(u) {
                                        if (isPdfUrl(u)) {
                                            return renderPdfViewerHtml(u, title);
                                        } else {
                                            var imgSrc = PKApp.driveImage ? PKApp.driveImage(u) : u;
                                            return `
                                                <div style="margin: 1.5rem 0; text-align: center;">
                                                    <img src="${imgSrc}" alt="${esc(title)}" style="max-width:100%; height:auto; border-radius:1rem; box-shadow:0 4px 16px rgba(0,0,0,0.08);" loading="lazy" />
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>
                            ` : ''}
                        </article>
                    `;
                });
            }

            html += `</div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error('Exception rendering ' + tableName + ':', err);
            renderError(container, 'เกิดข้อผิดพลาดในการแสดงผลเนื้อหา');
        }
    }

    // =========================================================================
    // 1. PKApp.pages.significance() - Rich content page
    // =========================================================================
    PKApp.pages.significance = async function() {
        await renderRichContentPage('significance', 'ที่มา และความสำคัญ');
    };

    // =========================================================================
    // 2. PKApp.pages.hoop() - Rich content page
    // =========================================================================
    PKApp.pages.hoop = async function() {
        await renderRichContentPage('hoop', 'เจตจำนง');
    };

    // =========================================================================
    // 3. PKApp.pages.anthority() - Rich content page
    // =========================================================================
    PKApp.pages.anthority = async function() {
        await renderRichContentPage('anthority', 'อำนาจหน้าที่');
    };

    // =========================================================================
    // 4. PKApp.pages.membernacc() - Organization Chart
    // Hierarchy:
    // 1. ผู้อำนวยการ
    // 2. รองผู้อำนวยการกลุ่มบริหารวิชาการ
    // 3. หัวหน้างานวิชาการ
    // 4. ครูที่ปรึกษา
    // 5. ประธาน ฯ
    // 6. รองประธาน ฯ
    // 7. เลขานุการ ฯ
    // 8. ผู้ช่วยเลขานุการ ฯ
    // 9. กรรมการ
    // 10. นักเรียนที่ปรึกษา ฯ
    // =========================================================================
    var HIERARCHY_CONFIG = [
        { level: 1, label: 'ผู้อำนวยการ', test: function(p) { return p.indexOf('ผู้อำนวยการ') !== -1 && p.indexOf('รอง') === -1; } },
        { level: 2, label: 'รองผู้อำนวยการกลุ่มบริหารวิชาการ', test: function(p) { return p.indexOf('รองผู้อำนวยการ') !== -1; } },
        { level: 3, label: 'หัวหน้างานวิชาการ', test: function(p) { return p.indexOf('หัวหน้า') !== -1 && p.indexOf('วิชาการ') !== -1; } },
        { level: 4, label: 'ครูที่ปรึกษา', test: function(p) { return p.indexOf('ครูที่ปรึกษา') !== -1 || (p.indexOf('ที่ปรึกษา') !== -1 && p.indexOf('ครู') !== -1); } },
        { level: 5, label: 'ประธาน ฯ', test: function(p) { return (p.indexOf('ประธาน') !== -1) && p.indexOf('รอง') === -1; } },
        { level: 6, label: 'รองประธาน ฯ', test: function(p) { return p.indexOf('รองประธาน') !== -1; } },
        { level: 7, label: 'เลขานุการ ฯ', test: function(p) { return (p.indexOf('เลขานุการ') !== -1 || p.indexOf('เลขา') !== -1) && p.indexOf('ผู้ช่วย') === -1; } },
        { level: 8, label: 'ผู้ช่วยเลขานุการ ฯ', test: function(p) { return p.indexOf('ผู้ช่วยเลขานุการ') !== -1 || p.indexOf('ผู้ช่วยเลขา') !== -1; } },
        { level: 9, label: 'กรรมการ', test: function(p) { return p.indexOf('กรรมการ') !== -1 && p.indexOf('ประธาน') === -1 && p.indexOf('เลขา') === -1; } },
        { level: 10, label: 'นักเรียนที่ปรึกษา ฯ', test: function(p) { return p.indexOf('นักเรียนที่ปรึกษา') !== -1 || p.indexOf('ที่ปรึกษา') !== -1; } }
    ];

    function mapPositionToLevel(positionStr) {
        if (!positionStr) return 9; // Default to กรรมการ
        var str = String(positionStr).trim();
        for (var i = 0; i < HIERARCHY_CONFIG.length; i++) {
            if (HIERARCHY_CONFIG[i].test(str)) {
                return HIERARCHY_CONFIG[i].level;
            }
        }
        return 9;
    }

    PKApp.pages.membernacc = async function(selectedYear) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดข้อมูลบุคลากร...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            // Step 1: Query distinct years from 'mamberNACC' table
            var yearResult = await sb.from('mamberNACC').select('year');
            if (yearResult.error) {
                console.error('Error fetching member years:', yearResult.error);
            }

            var allYears = (yearResult.data || [])
                .map(function(r) { return r.year; })
                .filter(function(y) { return y !== null && y !== undefined && y !== ''; });
            var uniqueYears = Array.from(new Set(allYears)).sort(function(a, b) { return Number(b) - Number(a); });

            var maxYear = uniqueYears.length > 0 ? uniqueYears[0] : null;
            var activeYear = selectedYear ? selectedYear : maxYear;

            // Step 2: Fetch members for the selected year
            var memberQuery = sb.from('mamberNACC').select('*');
            if (activeYear) {
                memberQuery = memberQuery.eq('year', activeYear);
            }
            var memberResult = await memberQuery;

            if (memberResult.error) {
                console.error('Error fetching members:', memberResult.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร: ' + memberResult.error.message);
                return;
            }

            var members = memberResult.data || [];

            // Group members into hierarchy levels
            var grouped = {};
            for (var lvl = 1; lvl <= 10; lvl++) {
                grouped[lvl] = [];
            }

            members.forEach(function(member) {
                var posLevel = mapPositionToLevel(member.position);
                grouped[posLevel].push(member);
            });

            // Default Avatar SVG
            var defaultAvatarSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c084fc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            บุคคลกร (คณะกรรมการ ป.ป.ช.สพฐ.น้อย)
                        </h1>
                        <p class="page-header-subtitle">
                            โรงเรียนภูเขียว ${activeYear ? 'ปีการศึกษา ' + esc(activeYear) : ''}
                        </p>
                        <div class="page-header-divider"></div>
                    </div>

                    ${uniqueYears.length > 1 ? `
                        <div class="page-controls-bar">
                            <div style="font-weight:600;color:#581c87;display:flex;align-items:center;gap:0.5rem;">
                                <svg style="width:20px;height:20px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                เลือกปีการศึกษา:
                            </div>
                            <select id="member-year-select" class="page-select" onchange="PKApp.pages.membernacc(this.value)">
                                ${uniqueYears.map(function(y) {
                                    return `<option value="${esc(y)}" ${String(y) === String(activeYear) ? 'selected' : ''}>ปีการศึกษา ${esc(y)}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    ` : ''}

                    <div class="org-chart">
            `;

            if (members.length === 0) {
                html += renderEmpty('ยังไม่มีข้อมูลบุคลากรสำหรับปีการศึกษานี้');
            } else {
                var hasPreviousLevel = false;

                HIERARCHY_CONFIG.forEach(function(lvlConfig) {
                    var levelMembers = grouped[lvlConfig.level];
                    if (!levelMembers || levelMembers.length === 0) return;

                    if (hasPreviousLevel) {
                        html += `<div class="org-line"></div>`;
                    }
                    hasPreviousLevel = true;

                    html += `
                        <div class="org-level" data-level="${lvlConfig.level}">
                            <div class="org-level-badge">${esc(lvlConfig.label)}</div>
                            <div class="org-cards-row">
                                ${levelMembers.map(function(m) {
                                    var photoUrl = m.photo || m.image || m.url || m.img || '';
                                    var imgSrc = photoUrl ? (PKApp.driveImage ? PKApp.driveImage(photoUrl) : photoUrl) : defaultAvatarSvg;
                                    var name = m.name || m.fullname || 'ไม่ระบุชื่อ';
                                    var position = m.position || lvlConfig.label;
                                    var studentClass = m.class || m.room || m.grade || '';
                                    var isTop = (lvlConfig.level === 1);

                                    return `
                                        <div class="org-card ${isTop ? 'org-card-top' : ''}">
                                            <div class="org-avatar-wrap">
                                                <img 
                                                    src="${imgSrc}" 
                                                    alt="${esc(name)}" 
                                                    class="org-avatar" 
                                                    loading="lazy" 
                                                    onerror="this.src='${defaultAvatarSvg}';" 
                                                />
                                            </div>
                                            <h4 class="org-name">${esc(name)}</h4>
                                            <p class="org-position">${esc(position)}</p>
                                            ${studentClass ? `<span class="org-class">ชั้น ${esc(studentClass)}</span>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.membernacc:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการแสดงผลโครงสร้างบุคลากร');
        }
    };

    // =========================================================================
    // 5. PKApp.pages.anacc() - Table Page for Classroom Representatives
    // Table: ANACC
    // Columns: ลำดับ | รหัสนักเรียน | ชื่อ - สกุล | ระดับชั้น
    // =========================================================================
    PKApp.pages.anacc = async function(selectedYear) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดข้อมูลตัวแทนห้อง...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            // Find distinct years
            var yearRes = await sb.from('ANACC').select('year');
            var allYears = (yearRes.data || [])
                .map(function(r) { return r.year; })
                .filter(function(y) { return y !== null && y !== undefined && y !== ''; });
            var uniqueYears = Array.from(new Set(allYears)).sort(function(a, b) { return Number(b) - Number(a); });

            var maxYear = uniqueYears.length > 0 ? uniqueYears[0] : null;
            var activeYear = selectedYear ? selectedYear : maxYear;

            var query = sb.from('ANACC').select('*');
            if (activeYear) {
                query = query.eq('year', activeYear);
            }
            var dataRes = await query;

            if (dataRes.error) {
                console.error('Error fetching ANACC:', dataRes.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + dataRes.error.message);
                return;
            }

            var rows = dataRes.data || [];

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            ตัวแทนห้อง (อนุกรรมการ ป.ป.ช.สพฐ.น้อย)
                        </h1>
                        <p class="page-header-subtitle">
                            ${activeYear ? 'ประจำปีการศึกษา ' + esc(activeYear) : 'โรงเรียนภูเขียว'}
                        </p>
                        <div class="page-header-divider"></div>
                    </div>

                    <div class="page-controls-bar">
                        <input 
                            type="text" 
                            id="anacc-search-input" 
                            class="page-search-input" 
                            placeholder="ค้นหารหัสนักเรียน, ชื่อ - สกุล, ชั้น..." 
                            onkeyup="PKApp.pages.filterAnaccTable(this.value)" 
                        />
                        ${uniqueYears.length > 1 ? `
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <label for="anacc-year-select" style="font-size:0.875rem;font-weight:600;color:#581c87;">ปีการศึกษา:</label>
                                <select id="anacc-year-select" class="page-select" onchange="PKApp.pages.anacc(this.value)">
                                    ${uniqueYears.map(function(y) {
                                        return `<option value="${esc(y)}" ${String(y) === String(activeYear) ? 'selected' : ''}>ปีการศึกษา ${esc(y)}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <div class="table-responsive">
                        <table class="data-table" id="anacc-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width:80px;">ลำดับ</th>
                                    <th style="width:160px;">รหัสนักเรียน</th>
                                    <th>ชื่อ - สกุล</th>
                                    <th class="text-center" style="width:140px;">ระดับชั้น</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (rows.length === 0) {
                html += `
                    <tr>
                        <td colspan="4" class="text-center" style="padding: 2.5rem; color:#6b7280;">
                            ยังไม่มีข้อมูลตัวแทนห้องสำหรับปีการศึกษานี้
                        </td>
                    </tr>
                `;
            } else {
                rows.forEach(function(row, idx) {
                    var studentId = row.student_id || row.std_id || row.code || row.student_code || '-';
                    var name = row.name || row.fullname || ((row.prefix || '') + (row.firstname || '') + ' ' + (row.lastname || '')).trim() || '-';
                    var studentClass = row.class || row.room || row.grade || row.level || '-';

                    html += `
                        <tr class="anacc-row" data-search="${esc((studentId + ' ' + name + ' ' + studentClass).toLowerCase())}">
                            <td class="text-center" style="font-weight:600;color:#7e22ce;">${idx + 1}</td>
                            <td style="font-family:monospace;font-weight:600;color:#374151;">${esc(studentId)}</td>
                            <td style="font-weight:500;color:#1f2937;">${esc(name)}</td>
                            <td class="text-center">
                                <span class="pk-badge pk-badge-purple">${esc(studentClass)}</span>
                            </td>
                        </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.anacc:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการแสดงผลตัวแทนห้อง');
        }
    };

    /**
     * Search filter for ANACC table
     */
    PKApp.pages.filterAnaccTable = function(query) {
        var q = (query || '').toLowerCase().trim();
        var rows = document.querySelectorAll('#anacc-table .anacc-row');
        rows.forEach(function(row) {
            var searchData = row.getAttribute('data-search') || '';
            if (!q || searchData.indexOf(q) !== -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    // =========================================================================
    // 6. PKApp.pages.newsPage(type, page) - Filtered News List
    // Table: 'new'
    // Types: 'ประกาศ', 'ประชาสัมพันธ์', 'คำสั่ง', 'จดหมายข่าว'
    // =========================================================================
    PKApp.pages.newsPage = async function(type, page) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        type = type || 'ประชาสัมพันธ์';
        page = Number(page) || 1;
        var pageSize = 12;

        renderLoading(container, 'กำลังโหลดข่าวสาร ' + type + '...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var from = (page - 1) * pageSize;
            var to = from + pageSize - 1;

            var query = sb.from('new')
                .select('*', { count: 'exact' })
                .eq('type', type)
                .order('created_at', { ascending: false })
                .range(from, to);

            var result = await query;

            // Fallback if created_at order fails
            if (result.error && result.error.message && result.error.message.indexOf('created_at') !== -1) {
                result = await sb.from('new')
                    .select('*', { count: 'exact' })
                    .eq('type', type)
                    .range(from, to);
            }

            if (result.error) {
                console.error('Error fetching news:', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดข่าวสาร: ' + result.error.message);
                return;
            }

            var items = result.data || [];
            var totalCount = result.count || items.length;
            var totalPages = Math.ceil(totalCount / pageSize) || 1;

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                            ${esc(type)}
                        </h1>
                        <p class="page-header-subtitle">
                            รายการข้อมูล ${esc(type)} ทั้งหมด (${totalCount} รายการ)
                        </p>
                        <div class="page-header-divider"></div>
                    </div>
            `;

            if (items.length === 0) {
                html += renderEmpty('ยังไม่มีข้อมูล ' + type);
            } else {
                html += `<div class="news-grid">`;
                items.forEach(function(item) {
                    var title = item.title || 'ไม่มีหัวข้อ';
                    var author = item.author || item.recorder || item.created_by || 'ป.ป.ช.สพฐ.น้อย';
                    var dateStr = formatDateOnly(item.created_at || item.date);

                    // Pick first image if available
                    var urls = parseUrls(item.url || item.photo || item.image || '');
                    var firstImg = '';
                    for (var i = 0; i < urls.length; i++) {
                        if (!isPdfUrl(urls[i])) {
                            firstImg = PKApp.driveImage ? PKApp.driveImage(urls[i]) : urls[i];
                            break;
                        }
                    }

                    html += `
                        <div class="news-card" onclick="PKApp.pages.newsDetail('${esc(item.id)}', '${esc(type)}')">
                            <div class="news-card-img-wrap">
                                ${firstImg ? `
                                    <img src="${firstImg}" alt="${esc(title)}" class="news-card-img" loading="lazy" />
                                ` : `
                                    <div class="news-card-img-placeholder">
                                        <svg style="width:48px;height:48px;opacity:0.6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                                        </svg>
                                        <span style="font-size:0.75rem;margin-top:0.375rem;font-weight:600;">ป.ป.ช.สพฐ.น้อย</span>
                                    </div>
                                `}
                                <span class="news-card-type-tag">${esc(item.type || type)}</span>
                            </div>
                            <div class="news-card-body">
                                <h3 class="news-card-title">${esc(title)}</h3>
                                <div class="news-card-meta">
                                    <span style="display:flex;align-items:center;gap:0.25rem;">
                                        <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        ${esc(author)}
                                    </span>
                                    <span style="display:flex;align-items:center;gap:0.25rem;">
                                        <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        ${esc(dateStr)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;

                // Pagination
                if (totalPages > 1) {
                    html += `
                        <div class="pagination-container">
                            <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="PKApp.pages.newsPage('${esc(type)}', ${page - 1})">
                                &lsaquo; ก่อนหน้า
                            </button>
                    `;
                    for (var p = 1; p <= totalPages; p++) {
                        if (p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)) {
                            html += `
                                <button class="page-btn ${p === page ? 'active' : ''}" onclick="PKApp.pages.newsPage('${esc(type)}', ${p})">
                                    ${p}
                                </button>
                            `;
                        } else if (p === page - 3 || p === page + 3) {
                            html += `<span style="padding:0.25rem 0.5rem;color:#9ca3af;">...</span>`;
                        }
                    }
                    html += `
                            <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="PKApp.pages.newsPage('${esc(type)}', ${page + 1})">
                                ถัดไป &rsaquo;
                            </button>
                        </div>
                    `;
                }
            }

            html += `</div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.newsPage:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดข่าวสาร');
        }
    };

    // Convenience aliases for newsPage
    PKApp.pages.announce = function() { return PKApp.pages.newsPage('ประกาศ'); };
    PKApp.pages.information = function() { return PKApp.pages.newsPage('ประชาสัมพันธ์'); };
    PKApp.pages.make = function() { return PKApp.pages.newsPage('คำสั่ง'); };
    PKApp.pages.newsletter = function() { return PKApp.pages.newsPage('จดหมายข่าว'); };

    // =========================================================================
    // 7. PKApp.pages.newsDetail(id) - Single News Detail View
    // Table: 'new'
    // =========================================================================
    PKApp.pages.newsDetail = async function(id, fallbackType) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดรายละเอียด...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var result = await sb.from('new').select('*').eq('id', id).single();
            if (result.error) {
                console.error('Error fetching news detail:', result.error);
                renderError(container, 'ไม่พบข้อมูลข่าวสารที่ต้องการ');
                return;
            }

            var item = result.data;
            var type = item.type || fallbackType || 'ข่าวสาร';
            var title = item.title || 'ไม่มีหัวข้อ';
            var author = item.author || item.recorder || item.created_by || 'ป.ป.ช.สพฐ.น้อย';
            var dateStr = formatDate(item.created_at || item.date, true);
            var contentHtml = item.content || item.mag || item.detail || item.description || '';
            var fileUrls = parseUrls(item.url || item.photo || item.image || '');

            var html = `
                <div class="page-content">
                    <div style="margin-bottom: 1.5rem;">
                        <button type="button" class="pk-btn pk-btn-secondary" onclick="window.history.back()">
                            <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            ย้อนกลับ
                        </button>
                    </div>

                    <article class="news-detail-wrapper">
                        <header class="news-detail-header">
                            <div class="news-detail-meta">
                                <span class="pk-badge pk-badge-purple">${esc(type)}</span>
                                <span style="display:flex;align-items:center;gap:0.375rem;">
                                    <svg style="width:16px;height:16px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    เผยแพร่เมื่อ: ${esc(dateStr)}
                                </span>
                                <span style="display:flex;align-items:center;gap:0.375rem;">
                                    <svg style="width:16px;height:16px;color:#7e22ce;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    ผู้บันทึก: ${esc(author)}
                                </span>
                            </div>
                            <h1 class="news-detail-title">${esc(title)}</h1>
                        </header>

                        ${contentHtml ? `
                            <div class="news-detail-content">
                                ${contentHtml}
                            </div>
                        ` : ''}

                        ${fileUrls.length > 0 ? `
                            <section class="news-attachments-section">
                                <h3 class="news-attachments-title">
                                    <svg style="width:20px;height:20px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                    </svg>
                                    ไฟล์แนบและเอกสารที่เกี่ยวข้อง (${fileUrls.length} รายการ)
                                </h3>

                                <div style="display:flex;flex-direction:column;gap:1.5rem;">
                                    ${fileUrls.map(function(u) {
                                        if (isPdfUrl(u)) {
                                            return renderPdfViewerHtml(u, title);
                                        } else {
                                            var imgSrc = PKApp.driveImage ? PKApp.driveImage(u) : u;
                                            return `
                                                <div style="text-align:center;margin: 1rem 0;">
                                                    <img src="${imgSrc}" alt="${esc(title)}" style="max-width:100%;border-radius:1rem;box-shadow:0 4px 16px rgba(0,0,0,0.08);" loading="lazy" />
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>
                            </section>
                        ` : ''}
                    </article>
                </div>
            `;

            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.newsDetail:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดรายละเอียดข่าวสาร');
        }
    };

    // =========================================================================
    // 8. PKApp.pages.certificate() - Certificate Registry
    // Table: 'Certificate'
    // Columns: วันที่ได้รับ | ชื่อเกียรติบัตร | หน่วยงานที่มอบ | ระดับ | ดาวน์โหลด
    // =========================================================================
    PKApp.pages.certificate = async function() {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดทะเบียนเกียรติบัตร...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var query = sb.from('Certificate').select('*').order('received_date', { ascending: false });
            var result = await query;

            if (result.error && result.error.message && result.error.message.indexOf('received_date') !== -1) {
                result = await sb.from('Certificate').select('*');
            }

            if (result.error) {
                console.error('Error fetching Certificate:', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดทะเบียนเกียรติบัตร: ' + result.error.message);
                return;
            }

            var items = result.data || [];

            // Extract unique award levels for filter dropdown
            var allLevels = items
                .map(function(i) { return i.award_level || i.level; })
                .filter(function(l) { return l !== null && l !== undefined && l !== ''; });
            var uniqueLevels = Array.from(new Set(allLevels));

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            ทะเบียนเกียรติบัตร
                        </h1>
                        <p class="page-header-subtitle">
                            รวบรวมเกียรติบัตรและรางวัลของ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว
                        </p>
                        <div class="page-header-divider"></div>
                    </div>

                    <div class="page-controls-bar">
                        <input 
                            type="text" 
                            id="cert-search-input" 
                            class="page-search-input" 
                            placeholder="ค้นหาชื่อเกียรติบัตร, หน่วยงานที่มอบ, ระดับ..." 
                            onkeyup="PKApp.pages.filterCertTable()" 
                        />
                        ${uniqueLevels.length > 0 ? `
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <label for="cert-level-filter" style="font-size:0.875rem;font-weight:600;color:#581c87;">ระดับ:</label>
                                <select id="cert-level-filter" class="page-select" onchange="PKApp.pages.filterCertTable()">
                                    <option value="">ทุกระดับ</option>
                                    ${uniqueLevels.map(function(lvl) {
                                        return `<option value="${esc(lvl)}">${esc(lvl)}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <div class="table-responsive">
                        <table class="data-table" id="cert-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width:70px;">ลำดับ</th>
                                    <th style="width:140px;">วันที่ได้รับ</th>
                                    <th>ชื่อเกียรติบัตร</th>
                                    <th>หน่วยงานที่มอบ</th>
                                    <th class="text-center" style="width:140px;">ระดับ</th>
                                    <th class="text-center" style="width:130px;">ดาวน์โหลด</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (items.length === 0) {
                html += `
                    <tr>
                        <td colspan="6" class="text-center" style="padding: 2.5rem; color:#6b7280;">
                            ยังไม่มีข้อมูลทะเบียนเกียรติบัตร
                        </td>
                    </tr>
                `;
            } else {
                items.forEach(function(item, idx) {
                    var receivedDate = formatDateOnly(item.received_date || item.date || item.created_at);
                    var certName = item.work_name || item.title || item.certificate_name || item.name || '-';
                    var org = item.responsible_org || item.organization || item.issuer || item.issued_by || '-';
                    var level = item.award_level || item.level || '-';
                    var fileUrl = item.url || item.file_url || item.certificate_file || item.pdf_url || '';
                    var fileDetails = getFileLinkDetails(fileUrl);
                    var downloadLink = fileDetails ? fileDetails.downloadUrl : '';

                    html += `
                        <tr class="cert-row" data-level="${esc(level)}" data-search="${esc((certName + ' ' + org + ' ' + level).toLowerCase())}">
                            <td class="text-center" style="font-weight:600;color:#7e22ce;">${idx + 1}</td>
                            <td style="color:#6b7280;white-space:nowrap;">${esc(receivedDate)}</td>
                            <td style="font-weight:600;color:#1f2937;">${esc(certName)}</td>
                            <td style="color:#4b5563;">${esc(org)}</td>
                            <td class="text-center">
                                <span class="pk-badge pk-badge-gold">${esc(level)}</span>
                            </td>
                            <td class="text-center">
                                ${downloadLink ? `
                                    <a href="${downloadLink}" target="_blank" rel="noopener noreferrer" class="pk-btn pk-btn-primary pk-btn-sm" style="display:inline-flex;">
                                        <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                        </svg>
                                        ดาวน์โหลด
                                    </a>
                                ` : `
                                    <span style="font-size:0.8125rem;color:#9ca3af;">ไม่มีไฟล์</span>
                                `}
                            </td>
                        </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.certificate:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดทะเบียนเกียรติบัตร');
        }
    };

    /**
     * Filter certificate table by query and award level
     */
    PKApp.pages.filterCertTable = function() {
        var searchInput = document.getElementById('cert-search-input');
        var levelSelect = document.getElementById('cert-level-filter');
        var q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        var lvl = (levelSelect ? levelSelect.value : '').trim();

        var rows = document.querySelectorAll('#cert-table .cert-row');
        rows.forEach(function(row) {
            var searchData = row.getAttribute('data-search') || '';
            var rowLevel = row.getAttribute('data-level') || '';

            var matchQuery = !q || searchData.indexOf(q) !== -1;
            var matchLevel = !lvl || rowLevel === lvl;

            if (matchQuery && matchLevel) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    // =========================================================================
    // 9. PKApp.pages.award(selectedLevel) - Awards & Achievements Showcase
    // Table: 'Certificate' (columns: activity_photo, award_level, medal_type,
    // medal_category, work_name, responsible_org, received_date, recipients, advisors)
    // =========================================================================
    PKApp.pages.award = async function(selectedLevel) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดผลงานและรางวัล...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var query = sb.from('Certificate').select('*').order('received_date', { ascending: false });
            var result = await query;

            if (result.error && result.error.message && result.error.message.indexOf('received_date') !== -1) {
                result = await sb.from('Certificate').select('*');
            }

            if (result.error) {
                console.error('Error fetching awards from Certificate:', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดผลงาน: ' + result.error.message);
                return;
            }

            var allAwards = result.data || [];

            // Extract unique award levels
            var allLevels = allAwards
                .map(function(a) { return a.award_level; })
                .filter(function(l) { return l !== null && l !== undefined && l !== ''; });
            var uniqueLevels = Array.from(new Set(allLevels));

            // Filter if selectedLevel is specified
            var filteredAwards = allAwards;
            if (selectedLevel) {
                filteredAwards = allAwards.filter(function(a) {
                    return String(a.award_level).trim() === String(selectedLevel).trim();
                });
            }

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                            ผลงานและรางวัลเชิดชูเกียรติ
                        </h1>
                        <p class="page-header-subtitle">
                            ความภาคภูมิใจและผลงานของ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว
                        </p>
                        <div class="page-header-divider"></div>
                    </div>

                    <div class="page-controls-bar">
                        <div style="font-weight:600;color:#581c87;display:flex;align-items:center;gap:0.5rem;">
                            <svg style="width:20px;height:20px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            กรองตามระดับรางวัล:
                        </div>
                        <select class="page-select" onchange="PKApp.pages.award(this.value)">
                            <option value="">ทั้งหมด (${allAwards.length} รายการ)</option>
                            ${uniqueLevels.map(function(lvl) {
                                return `<option value="${esc(lvl)}" ${String(lvl) === String(selectedLevel) ? 'selected' : ''}>${esc(lvl)}</option>`;
                            }).join('')}
                        </select>
                    </div>
            `;

            if (filteredAwards.length === 0) {
                html += renderEmpty('ยังไม่มีข้อมูลผลงานในระดับนี้');
            } else {
                html += `<div class="award-cards-grid">`;
                filteredAwards.forEach(function(item, idx) {
                    var workName = item.work_name || item.title || 'ผลงานกิจกรรม';
                    var awardLevel = item.award_level || 'ระดับโรงเรียน';
                    var medalType = item.medal_type || '';
                    var medalCategory = item.medal_category || '';
                    var responsibleOrg = item.responsible_org || '-';
                    var receivedDate = formatDateOnly(item.received_date || item.date);
                    var recipients = item.recipients || item.recipient || '-';
                    var advisors = item.advisors || item.advisor || '-';

                    // Parse activity photos
                    var photos = parseUrls(item.activity_photo || item.url || '');
                    // Filter out pdfs for photo slider
                    photos = photos.filter(function(p) { return !isPdfUrl(p); });

                    var carouselId = 'award-carousel-' + idx;

                    // Medal badge styling
                    var medalClass = 'medal-gold';
                    if (medalType.indexOf('เงิน') !== -1) medalClass = 'medal-silver';
                    else if (medalType.indexOf('ทองแดง') !== -1) medalClass = 'medal-bronze';

                    html += `
                        <div class="award-card">
                            <div class="award-carousel" id="${carouselId}">
                                <div class="award-carousel-slides">
                                    ${photos.length > 0 ? photos.map(function(p, pIdx) {
                                        var imgSrc = PKApp.driveImage ? PKApp.driveImage(p) : p;
                                        return `
                                            <div class="award-carousel-slide ${pIdx === 0 ? 'active' : ''}">
                                                <img src="${imgSrc}" alt="${esc(workName)}" loading="lazy" />
                                            </div>
                                        `;
                                    }).join('') : `
                                        <div class="award-carousel-slide active" style="background:linear-gradient(135deg, #581c87, #7e22ce);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                                            <svg style="width:56px;height:56px;color:#d4a843;margin-bottom:0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                                            </svg>
                                            <span style="font-size:0.875rem;font-weight:600;color:#fef3c7;">ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</span>
                                        </div>
                                    `}
                                </div>

                                ${photos.length > 1 ? `
                                    <button type="button" class="carousel-btn prev" onclick="PKApp.pages.slideCarousel('${carouselId}', -1)" aria-label="รูปก่อนหน้า">&lsaquo;</button>
                                    <button type="button" class="carousel-btn next" onclick="PKApp.pages.slideCarousel('${carouselId}', 1)" aria-label="รูปถัดไป">&rsaquo;</button>
                                    <div class="carousel-dots">
                                        ${photos.map(function(_, dIdx) {
                                            return `<span class="carousel-dot ${dIdx === 0 ? 'active' : ''}" onclick="PKApp.pages.goToCarouselSlide('${carouselId}', ${dIdx})"></span>`;
                                        }).join('')}
                                    </div>
                                    <div class="carousel-counter"><span class="current-slide">1</span>/${photos.length}</div>
                                ` : ''}
                            </div>

                            <div class="award-card-body">
                                <div class="award-badges-row">
                                    ${medalType ? `
                                        <span class="medal-badge ${medalClass}">
                                            <svg style="width:14px;height:14px;" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                            ${esc(medalType)}
                                        </span>
                                    ` : ''}
                                    <span class="pk-badge pk-badge-purple">${esc(awardLevel)}</span>
                                    ${medalCategory ? `<span class="pk-badge pk-badge-gold">${esc(medalCategory)}</span>` : ''}
                                </div>

                                <h3 class="award-work-name">${esc(workName)}</h3>

                                <ul class="award-info-list">
                                    <li class="award-info-item">
                                        <span class="award-info-label">หน่วยงาน:</span>
                                        <span>${esc(responsibleOrg)}</span>
                                    </li>
                                    <li class="award-info-item">
                                        <span class="award-info-label">วันที่ได้รับ:</span>
                                        <span>${esc(receivedDate)}</span>
                                    </li>
                                    <li class="award-info-item">
                                        <span class="award-info-label">ผู้ได้รับ:</span>
                                        <span style="font-weight:500;color:#1f2937;">${esc(recipients)}</span>
                                    </li>
                                    <li class="award-info-item">
                                        <span class="award-info-label">ครูที่ปรึกษา:</span>
                                        <span>${esc(advisors)}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            html += `</div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.award:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดผลงาน');
        }
    };

    /**
     * Slide award photo carousel relative
     */
    PKApp.pages.slideCarousel = function(carouselId, direction) {
        var el = document.getElementById(carouselId);
        if (!el) return;

        var slides = el.querySelectorAll('.award-carousel-slide');
        var dots = el.querySelectorAll('.carousel-dot');
        var counter = el.querySelector('.current-slide');
        if (slides.length <= 1) return;

        var currentIdx = 0;
        slides.forEach(function(s, idx) {
            if (s.classList.contains('active')) currentIdx = idx;
        });

        var newIdx = (currentIdx + direction + slides.length) % slides.length;
        PKApp.pages.goToCarouselSlide(carouselId, newIdx);
    };

    /**
     * Jump award photo carousel to index
     */
    PKApp.pages.goToCarouselSlide = function(carouselId, index) {
        var el = document.getElementById(carouselId);
        if (!el) return;

        var slides = el.querySelectorAll('.award-carousel-slide');
        var dots = el.querySelectorAll('.carousel-dot');
        var counter = el.querySelector('.current-slide');
        if (!slides[index]) return;

        slides.forEach(function(s) { s.classList.remove('active'); });
        dots.forEach(function(d) { d.classList.remove('active'); });

        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        if (counter) counter.textContent = index + 1;
    };

    // =========================================================================
    // 10. PKApp.pages.plan() - Project Plans with 4-Step Timeline
    // Table: 'plan'
    // 4 Steps: ร่าง -> เสนอ -> ดำเนินการ -> แล้วเสร็จ
    // If proposal = 'ไม่ผ่าน', show red X and steps c, d disabled
    // =========================================================================
    PKApp.pages.plan = async function() {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        renderLoading(container, 'กำลังโหลดแผนดำเนินโครงการ...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var result = await sb.from('plan').select('*').order('created_at', { ascending: false });
            if (result.error && result.error.message && result.error.message.indexOf('created_at') !== -1) {
                result = await sb.from('plan').select('*');
            }

            if (result.error) {
                console.error('Error fetching plan:', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดแผนโครงการ: ' + result.error.message);
                return;
            }

            var plans = result.data || [];

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                            </svg>
                            นโยบาย และแผนดำเนินโครงการ
                        </h1>
                        <p class="page-header-subtitle">
                            ความก้าวหน้าและการติดตามการดำเนินงานโครงการ ป.ป.ช.สพฐ.น้อย
                        </p>
                        <div class="page-header-divider"></div>
                    </div>
            `;

            if (plans.length === 0) {
                html += renderEmpty('ยังไม่มีข้อมูลนโยบายและแผนดำเนินโครงการ');
            } else {
                plans.forEach(function(item) {
                    var projectName = item.project_name || item.name || item.title || 'ไม่มีชื่อโครงการ';
                    var responsiblePerson = item.responsible_person || item.responsible || item.author || '-';
                    var year = item.year || item.fiscal_year || '';
                    var proposalStatus = (item.proposal || '').trim();
                    var overallStatus = (item.status || '').trim();
                    var fileUrl = item.url || item.file_url || item.pdf_url || '';
                    var fileDetails = getFileLinkDetails(fileUrl);

                    var isProposalFailed = (proposalStatus === 'ไม่ผ่าน' || overallStatus === 'ไม่ผ่าน');

                    // Determine current step index (1: ร่าง, 2: เสนอ, 3: ดำเนินการ, 4: แล้วเสร็จ)
                    var currentStep = 1;
                    if (overallStatus.indexOf('แล้วเสร็จ') !== -1 || overallStatus.indexOf('เสร็จสิ้น') !== -1 || overallStatus.indexOf('สำเร็จ') !== -1) {
                        currentStep = 4;
                    } else if (overallStatus.indexOf('ดำเนินการ') !== -1 || overallStatus.indexOf('กำลัง') !== -1) {
                        currentStep = 3;
                    } else if (overallStatus.indexOf('เสนอ') !== -1 || proposalStatus === 'ผ่าน') {
                        currentStep = 2;
                    } else if (item.step) {
                        currentStep = Number(item.step) || 1;
                    }

                    // Render 4 steps:
                    // Step 1: ร่าง
                    // Step 2: เสนอ
                    // Step 3: ดำเนินการ
                    // Step 4: แล้วเสร็จ
                    var step1Class = 'completed';
                    var step2Class = '';
                    var step3Class = '';
                    var step4Class = '';

                    var step2Icon = '2';
                    var step2Subtext = 'เสนอ';

                    if (isProposalFailed) {
                        step2Class = 'failed';
                        step2Icon = '✕';
                        step2Subtext = 'ไม่ผ่าน';
                        step3Class = 'disabled';
                        step4Class = 'disabled';
                    } else {
                        if (currentStep >= 2) {
                            step2Class = currentStep > 2 ? 'completed' : 'active';
                            step2Icon = currentStep > 2 ? '✓' : '2';
                        }
                        if (currentStep >= 3) {
                            step3Class = currentStep > 3 ? 'completed' : 'active';
                        }
                        if (currentStep >= 4) {
                            step4Class = 'completed';
                        }
                    }

                    html += `
                        <article class="plan-card">
                            <div class="plan-header">
                                <div>
                                    <h3 class="plan-title">${esc(projectName)}</h3>
                                    <div class="plan-meta">
                                        ผู้รับผิดชอบ: <span style="font-weight:600;color:#374151;">${esc(responsiblePerson)}</span>
                                        ${year ? ` &bull; ปีงบประมาณ/ปีการศึกษา: <span style="font-weight:600;color:#581c87;">${esc(year)}</span>` : ''}
                                    </div>
                                </div>
                                <div>
                                    ${fileDetails ? `
                                        <a href="${fileDetails.downloadUrl}" target="_blank" rel="noopener noreferrer" class="pk-btn pk-btn-primary pk-btn-sm">
                                            <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            เอกสารโครงการ (PDF)
                                        </a>
                                    ` : `
                                        <span class="pk-badge pk-badge-purple">${esc(overallStatus || 'กำลังดำเนินการ')}</span>
                                    `}
                                </div>
                            </div>

                            <div class="timeline">
                                <div class="timeline-track"></div>

                                <!-- Step 1: ร่าง -->
                                <div class="timeline-step ${step1Class}">
                                    <div class="timeline-step-circle">✓</div>
                                    <span class="timeline-step-label">1. ร่างโครงการ</span>
                                </div>

                                <!-- Step 2: เสนอ -->
                                <div class="timeline-step ${step2Class}">
                                    <div class="timeline-step-circle">${step2Icon}</div>
                                    <span class="timeline-step-label">2. ${step2Subtext}</span>
                                </div>

                                <!-- Step 3: ดำเนินการ -->
                                <div class="timeline-step ${step3Class}">
                                    <div class="timeline-step-circle">
                                        ${isProposalFailed ? '&ndash;' : (currentStep > 3 ? '✓' : '3')}
                                    </div>
                                    <span class="timeline-step-label">3. ดำเนินการ</span>
                                </div>

                                <!-- Step 4: แล้วเสร็จ -->
                                <div class="timeline-step ${step4Class}">
                                    <div class="timeline-step-circle">
                                        ${isProposalFailed ? '&ndash;' : (currentStep >= 4 ? '✓' : '4')}
                                    </div>
                                    <span class="timeline-step-label">4. แล้วเสร็จ</span>
                                </div>
                            </div>
                        </article>
                    `;
                });
            }

            html += `</div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.plan:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดแผนโครงการ');
        }
    };

    // =========================================================================
    // 11. PKApp.pages.mony() - Budget (Under Development)
    // =========================================================================
    PKApp.pages.mony = async function() {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        var html = `
            <div class="page-content">
                <div class="page-header">
                    <h1 class="page-header-title">
                        <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        งบประมาณ
                    </h1>
                    <p class="page-header-subtitle">
                        ระบบสารสนเทศการบริหารและจัดการงบประมาณ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว
                    </p>
                    <div class="page-header-divider"></div>
                </div>

                <div class="coming-soon-card">
                    <div class="coming-soon-icon-wrap">
                        <svg style="width:48px;height:48px;color:#6b21a8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <h2 style="font-size:1.625rem;font-weight:700;color:#581c87;margin:0 0 0.75rem 0;">
                        รอพัฒนา
                    </h2>
                    <p style="color:#6b7280;font-size:1rem;line-height:1.6;margin:0 0 1.5rem 0;">
                        หน้านี้กำลังอยู่ระหว่างการพัฒนาระบบการรายงานและจัดสรรงบประมาณ<br/>
                        โปรดติดตามการอัปเดตในรอบถัดไป
                    </p>
                    <button type="button" class="pk-btn pk-btn-primary" onclick="window.location.hash='#/'">
                        <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        กลับสู่หน้าแรก
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    };

    // =========================================================================
    // 12. PKApp.pages.simpleFilePage(tableName, title) - Generic File List
    // Used for: culecculum, tammanun, law
    // Columns: เรื่อง | ไฟล์ | ผู้บันทึก (และ วันที่)
    // =========================================================================
    PKApp.pages.simpleFilePage = async function(tableName, title) {
        ensureComponentStyles();
        var container = getContainer();
        if (!container) return;

        title = title || tableName;
        renderLoading(container, 'กำลังโหลด ' + title + '...');

        var sb = getSupabase();
        if (!sb) {
            renderError(container, 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            return;
        }

        try {
            var query = sb.from(tableName).select('*').order('created_at', { ascending: false });
            var result = await query;

            if (result.error && result.error.message && result.error.message.indexOf('created_at') !== -1) {
                result = await sb.from(tableName).select('*');
            }

            if (result.error) {
                console.error('Error fetching ' + tableName + ':', result.error);
                renderError(container, 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + result.error.message);
                return;
            }

            var rows = result.data || [];

            var html = `
                <div class="page-content">
                    <div class="page-header">
                        <h1 class="page-header-title">
                            <svg style="width:32px;height:32px;color:#d4a843;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            ${esc(title)}
                        </h1>
                        <p class="page-header-subtitle">
                            เอกสารและสารสนเทศ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว
                        </p>
                        <div class="page-header-divider"></div>
                    </div>

                    <div class="page-controls-bar">
                        <input 
                            type="text" 
                            id="file-search-input" 
                            class="page-search-input" 
                            placeholder="ค้นหาชื่อเอกสาร, เรื่อง, ผู้บันทึก..." 
                            onkeyup="PKApp.pages.filterSimpleFileTable(this.value)" 
                        />
                        <span style="font-size:0.875rem;color:#6b7280;font-weight:500;">
                            พบทั้งหมด ${rows.length} รายการ
                        </span>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table" id="simple-file-table">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width:70px;">ลำดับ</th>
                                    <th>เรื่อง / ชื่อเอกสาร</th>
                                    <th class="text-center" style="width:160px;">ไฟล์</th>
                                    <th style="width:180px;">ผู้บันทึก</th>
                                    <th style="width:140px;">วันที่</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (rows.length === 0) {
                html += `
                    <tr>
                        <td colspan="5" class="text-center" style="padding: 2.5rem; color:#6b7280;">
                            ยังไม่มีข้อมูลเอกสารสำหรับ ${esc(title)}
                        </td>
                    </tr>
                `;
            } else {
                rows.forEach(function(row, idx) {
                    var subject = row.title || row.name || row.subject || 'ไม่มีชื่อเรื่อง';
                    var author = row.author || row.recorder || row.created_by || row.user_name || '-';
                    var dateStr = formatDateOnly(row.created_at || row.date);
                    var fileUrl = row.url || row.file || row.pdf_url || '';
                    var fileDetails = getFileLinkDetails(fileUrl);

                    html += `
                        <tr class="file-row" data-search="${esc((subject + ' ' + author).toLowerCase())}">
                            <td class="text-center" style="font-weight:600;color:#7e22ce;">${idx + 1}</td>
                            <td style="font-weight:600;color:#1f2937;">${esc(subject)}</td>
                            <td class="text-center">
                                ${fileDetails ? `
                                    <a href="${fileDetails.downloadUrl}" target="_blank" rel="noopener noreferrer" class="pk-btn pk-btn-primary pk-btn-sm" style="display:inline-flex;">
                                        <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        ดู / ดาวน์โหลด
                                    </a>
                                ` : `
                                    <span style="font-size:0.8125rem;color:#9ca3af;">ไม่มีไฟล์</span>
                                `}
                            </td>
                            <td style="color:#4b5563;">${esc(author)}</td>
                            <td style="color:#6b7280;white-space:nowrap;">${esc(dateStr)}</td>
                        </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (err) {
            console.error('Exception in PKApp.pages.simpleFilePage:', err);
            renderError(container, 'เกิดข้อผิดพลาดในการโหลดเอกสาร');
        }
    };

    /**
     * Search filter for simple file table
     */
    PKApp.pages.filterSimpleFileTable = function(query) {
        var q = (query || '').toLowerCase().trim();
        var rows = document.querySelectorAll('#simple-file-table .file-row');
        rows.forEach(function(row) {
            var searchData = row.getAttribute('data-search') || '';
            if (!q || searchData.indexOf(q) !== -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    // Convenience aliases for simple file pages
    PKApp.pages.culecculum = function() {
        return PKApp.pages.simpleFilePage('culecculum', 'หลักสูตร');
    };

    PKApp.pages.tammanun = function() {
        return PKApp.pages.simpleFilePage('tammanun', 'ธรรมนูญ (ภายใน)');
    };

    PKApp.pages.law = function() {
        return PKApp.pages.simpleFilePage('law', 'กฎหมาย (คณะกรรมาธิการ)');
    };

})();
