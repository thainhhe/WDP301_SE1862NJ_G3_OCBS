"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film } from "lucide-react"

const TheaterForm = ({ theater, onSubmit, onCancel }) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Populate the form with existing theater data when in "edit" mode
    useEffect(() => {
        if (theater) {
            setName(theater.name || "");
        } else {
            setName(""); // Reset form when creating a new one
        }
        setError(""); // Clear any previous errors
    }, [theater]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!name.trim()) {
            setError("Theater name cannot be empty.");
            return;
        }
        setError("");

        setLoading(true);
        try {
            // Pass the form data up to the parent component
            await onSubmit({ name });
        } catch (err) {
            console.error("Form submission error:", err);
            // Parent component will handle showing the toast error
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Theater Name Input */}
            <div>
                <label htmlFor="theaterName" className="block text-sm font-medium text-gray-700">
                    Theater Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="theaterName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Theater 2, IMAX Laser"
                        className={`pl-10 ${error ? "border-red-500" : ""}`}
                    />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Informational Note */}
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                <span>
                    This theater will be associated with the currently selected branch.
                    You can assign a seat layout later from the Seat Layout Management page.
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? "Saving..." : (theater ? "Update Theater" : "Create Theater")}
                </Button>
            </div>
        </form>
    );
};

export default TheaterForm;