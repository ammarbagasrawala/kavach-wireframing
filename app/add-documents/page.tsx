"use client";

import React from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { EnrichmentHub } from "../components/EnrichmentHub";

export default function AddDocumentsPage() {
    return (
        <Layout currentPage="Add Documents">
            <PageHeader
                title="Add Documents"
                breadcrumbs={[{ label: "Kavach" }, { label: "Add Documents" }]}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--background)]">
                <div className="max-w-2xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-elevation-sm">
                    <EnrichmentHub
                        standalone={true}
                        onNext={() => window.location.href = "/"}
                    />
                </div>
            </main>
        </Layout>
    );
}
