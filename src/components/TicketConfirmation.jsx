import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function TicketConfirmation() {
    const ticketDetails = useSelector((state) => state.booking.booking[0]);
    const user = useSelector((state) => state.auth.user);

    useEffect(async() => {
        if (ticketDetails && user) {
            const notification = {
                message: `Your ticket from ${ticketDetails.source} to ${ticketDetails.destination} has been booked successfully.`,
                read: false
            };
            await axios.put(`https://neo-metro-backend.vercel.app/api/users/${user.username}/addnotification`, notification)
                .then(response => {
                    console.log("Notification sent successfully:", response.data);
                })
                .catch(error => {
                    console.error("Error sending notification:", error);
                });
        }
    }, [ticketDetails, user]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full">
                <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
                    Ticket Confirmation
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center justify-center">
                        {ticketDetails.qrCode ? (
                            <img
                                src={`data:image/png;base64,${ticketDetails.qrCode}`}
                                alt="QR Code"
                                className="w-48 h-48"
                            />
                        ) : (
                            <p className="text-gray-600">Loading QR code...</p>
                        )}
                        <p className="mt-4 text-sm text-gray-600">
                            Scan this QR code at the station.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-800">Journey Details</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <span className="font-medium">From:</span> {ticketDetails.source}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">To:</span> {ticketDetails.destination}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Date:</span> {ticketDetails.journeyDate}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Fare:</span> {ticketDetails.fare}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Transaction ID:</span> {ticketDetails.transactionId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Thank you for choosing NeoMetro. Have a safe journey!</p>
                    <p className="mt-2">
                        Need help? Contact us at{" "}
                        <a href="mailto:support@neometro.com" className="text-blue-600 hover:underline">
                            support@neometro.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}