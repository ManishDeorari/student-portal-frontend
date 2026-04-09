"use client";
import React from "react";
import LoadingOverlay from "./components/ui/LoadingOverlay";

export default function Loading() {
    return <LoadingOverlay isVisible={true} message="Loading Page..." type="page" />;
}
