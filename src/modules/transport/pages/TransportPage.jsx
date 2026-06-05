import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import "../styles/transport.css";

import TransportForm from "./TransportForm";

import { getService } from "../../../core/serviceRegistry";
const transportService = getService("transport");

const TransportPage = () => {
    const [routes, setRoutes] = useState([]);

    const [dashboard, setDashboard] = useState(
        {}
    );

    const [selectedRoute, setSelectedRoute] =
        useState(null);

    const [search, setSearch] = useState("");

    const loadData = () => {
        setRoutes(transportService.getTransportRoutes());

        setDashboard(transportService.getTransportDashboard());
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRoutes = useMemo(() => {
        return routes.filter((route) => {
            const value =
                `${route.routeName} ${route.vehicleNumber} ${route.driverName}`.toLowerCase();

            return value.includes(
                search.toLowerCase()
            );
        });
    }, [routes, search]);

    const handleSave = (payload) => {
        transportService.createTransportRoute(payload);

        loadData();

        setSelectedRoute(null);
    };

    const handleEdit = (route) => {
        setSelectedRoute(route);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm(
            "Delete this route?"
        );

        if (!confirmDelete) return;

        transportService.removeTransportRoute(id);

        loadData();
    };

    const handleStatusToggle = (id) => {
        transportService.toggleRouteStatus(id);

        loadData();
    };

    return (
        <div className="transport-page">
            <div className="transport-header">
                <div>
                    <h1>
                        Transport Management
                    </h1>

                    <p>
                        Professional ERP
                        transport operations
                        center
                    </p>
                </div>

                <div className="transport-live-badge">
                    ● LIVE TRACKING READY
                </div>
            </div>

            <div className="transport-dashboard-grid">
                <div className="transport-stat-card">
                    <span>Total Routes</span>

                    <h2>
                        {dashboard.totalRoutes ||
                            0}
                    </h2>
                </div>

                <div className="transport-stat-card">
                    <span>Active Vehicles</span>

                    <h2>
                        {dashboard.activeVehicles ||
                            0}
                    </h2>
                </div>

                <div className="transport-stat-card">
                    <span>Total Students</span>

                    <h2>
                        {dashboard.totalStudents ||
                            0}
                    </h2>
                </div>

                <div className="transport-stat-card">
                    <span>Monthly Revenue</span>

                    <h2>
                        ₹{" "}
                        {Number(
                            dashboard.monthlyRevenue ||
                            0
                        ).toLocaleString()}
                    </h2>
                </div>
            </div>

            <TransportForm
                selectedRoute={selectedRoute}
                onSave={handleSave}
            />

            <div className="transport-table-wrapper">
                <div className="transport-table-header">
                    <div>
                        <h2>
                            Route Management
                        </h2>

                        <p>
                            Manage routes,
                            vehicles, drivers
                            and tracking
                        </p>
                    </div>

                    <input
                        type="text"
                        placeholder="Search routes..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="transport-table-scroll">
                    <table className="transport-table">
                        <thead>
                            <tr>
                                <th>Route</th>

                                <th>Vehicle</th>

                                <th>Driver</th>

                                <th>
                                    Pickup
                                    Points
                                </th>

                                <th>
                                    Monthly
                                    Fee
                                </th>

                                <th>Status</th>

                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRoutes.length >
                                0 ? (
                                filteredRoutes.map(
                                    (
                                        route
                                    ) => (
                                        <tr
                                            key={
                                                route.id
                                            }
                                        >
                                            <td>
                                                <div className="route-info">
                                                    <strong>
                                                        {
                                                            route.routeName
                                                        }
                                                    </strong>

                                                    <small>
                                                        ID:
                                                        {" "}
                                                        {
                                                            route.id
                                                        }
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="vehicle-info">
                                                    <strong>
                                                        {
                                                            route.vehicleNumber
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            route.vehicleType
                                                        }
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="driver-info">
                                                    <strong>
                                                        {
                                                            route.driverName
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            route.driverPhone
                                                        }
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    route
                                                        .pickupPoints
                                                        ?.length
                                                }
                                            </td>

                                            <td>
                                                ₹{" "}
                                                {Number(
                                                    route.monthlyFee ||
                                                    0
                                                ).toLocaleString()}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${route.active
                                                            ? "active"
                                                            : "inactive"
                                                        }`}
                                                >
                                                    {route.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            handleEdit(
                                                                route
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="status-btn"
                                                        onClick={() =>
                                                            handleStatusToggle(
                                                                route.id
                                                            )
                                                        }
                                                    >
                                                        Toggle
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                route.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        No transport
                                        routes found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransportPage;