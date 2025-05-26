"use client";

import { useContext, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("Pendiente");
  const [userBookings, setUserBookings] = useState({
    Pendiente: [],
    Completada: [],
  });
  const [reseñasPorCita, setReseñasPorCita] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/citas/buscador/${user.id}`
        );
        if (!response.ok) throw new Error("Error al obtener citas");

        const citas = await response.json();

        const citasConDetalles = await Promise.all(
          citas.map(async (cita) => {
            const resServicio = await fetch(
              `http://localhost:8080/api/servicios/${cita.idServicio}`
            );
            const servicio = await resServicio.json();

            return {
              ...cita,
              serviceDetails: {
                title: servicio.nombre,
                prestador: servicio.prestador,
                image: servicio.foto || "/placeholder.svg",
              },
            };
          })
        );

        const estado = {
          Pendiente: [],
          Completada: [],
        };

        const mapReseñas = {};

        await Promise.all(
          citasConDetalles.map(async (cita) => {
            if (cita.estado === "Completada") {
              try {
                const res = await fetch(
                  `http://localhost:8080/api/resenas/citaid/${cita.id}`
                );

                if (res.status === 200) {
                  const data = await res.json();
                  mapReseñas[cita.id] = !!data;
                } else if (res.status === 404) {
                  console.warn(`Cita ${cita.id}: sin reseña (404)`);
                  mapReseñas[cita.id] = false;
                } else {
                  console.error(
                    `Error inesperado ${res.status} para cita ${cita.id}`
                  );
                  mapReseñas[cita.id] = false;
                }
              } catch (error) {
                console.error(
                  `Error al consultar reseña de cita ${cita.id}:`,
                  error
                );
                mapReseñas[cita.id] = false;
              }

              estado.Completada.push(cita);
            } else {
              estado.Pendiente.push(cita);
            }
          })
        );

        setUserBookings(estado);
        setReseñasPorCita(mapReseñas);
      } catch (error) {
        console.error("Error al cargar citas:", error);
      }
    };

    if (user && user.rol === "BUSCADOR") {
      fetchBookings();
    }
  }, [user]);

  const handleCancelarCita = async (idCita) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas cancelar esta cita?"
    );
    if (!confirmacion) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/citas/eliminar/${idCita}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Error al cancelar la cita");

      setUserBookings((prev) => ({
        ...prev,
        Pendiente: prev.Pendiente.filter((cita) => cita.id !== idCita),
      }));
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
      alert("No se pudo cancelar la cita. Intenta nuevamente.");
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (user.isProfessional) return <Navigate to="/pro-dashboard" />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header de usuario */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <img
                  src={
                    user.imagen ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.nombre
                    )}&background=0D8ABC&color=fff`
                  }
                  alt={user.nombre}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user.nombre}</h1>
                  <p className="text-gray-600">{user.correo}</p>
                  {user.numero && (
                    <p className="text-gray-600">Celular: +{user.numero}</p>
                  )}
                </div>
              </div>
              <Link to="/search" className="btn-primary">
                Buscar Servicios
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-6">
            <div className="border-b mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("Pendiente")}
                  className={`pb-4 px-1 ${
                    activeTab === "Pendiente"
                      ? "border-b-2 border-green-500 text-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Próximas Citas
                </button>
                <button
                  onClick={() => setActiveTab("Completada")}
                  className={`pb-4 px-1 ${
                    activeTab === "Completada"
                      ? "border-b-2 border-green-500 text-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Historial
                </button>
              </nav>
            </div>

            {/* Citas Pendientes */}
            {activeTab === "Pendiente" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Próximas Citas</h2>
                {userBookings.Pendiente.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.Pendiente.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <img
                            src={booking.serviceDetails.image}
                            alt={booking.serviceDetails?.title || "Servicio"}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {booking.serviceDetails?.title || "Servicio"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Proveedor:{" "}
                              {booking.serviceDetails?.prestador?.nombre ||
                                "Prestador desconocido"}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600">
                                {booking.fecha}
                              </span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-sm text-gray-600">
                                {booking.hora}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCancelarCita(booking.id)}
                            className="btn-secondary text-sm"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              const numero =
                                booking.serviceDetails.prestador?.numero;
                              if (numero) {
                                const mensaje = `Hola ${booking.serviceDetails.prestador.nombre}, soy ${user.nombre} desde Conectados. Te escribo por el servicio ${booking.serviceDetails.title}.`;
                                window.open(
                                  `https://wa.me/${numero.replace(
                                    "+",
                                    ""
                                  )}?text=${encodeURIComponent(mensaje)}`,
                                  "_blank"
                                );
                              } else {
                                alert(
                                  "Este usuario no tiene un número registrado."
                                );
                              }
                            }}
                            className="btn-primary text-sm"
                          >
                            Contactar por WhatsApp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No tienes citas programadas.
                  </p>
                )}
              </div>
            )}

            {/* Citas Completadas */}
            {activeTab === "Completada" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Historial de Servicios
                </h2>
                {userBookings.Completada.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.Completada.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <img
                            src={booking.serviceDetails.image}
                            alt={booking.serviceDetails?.title || "Servicio"}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {booking.serviceDetails?.title || "Servicio"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Proveedor:{" "}
                              {booking.serviceDetails?.prestador?.nombre ||
                                "Prestador desconocido"}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600">
                                {booking.fecha}
                              </span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-sm text-green-600 font-medium">
                                Completado
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {reseñasPorCita[booking.id] ? (
                            <Link
                              to={`/service/${booking.idServicio}`}
                              className="btn-secondary text-sm"
                            >
                              Ver Servicio
                            </Link>
                          ) : (
                            <Link
                              to={`/crear-resena/${booking.id}`}
                              className="btn-primary text-sm"
                            >
                              Dejar Reseña
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No tienes servicios completados.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
