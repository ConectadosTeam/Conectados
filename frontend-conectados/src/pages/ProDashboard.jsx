"use client";


import { useContext, useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import ConfirmationModal from "../components/ConfirmationModal";

const ProDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("services");
  const [proServices, setProServices] = useState([]);
  const [proBookings, setProBookings] = useState({
    upcoming: [],
    completed: [],
  });

  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const loadProData = async () => {
    if (user && user.rol === "PRESTADOR") {
      try {
        // Obtener servicios del prestador (solo para la pestaña de servicios)
        const serviciosResponse = await fetch(`http://localhost:8080/api/servicios/prestador/${user.id}`);
        if (!serviciosResponse.ok) throw new Error("Error al obtener servicios");
        const servicios = await serviciosResponse.json();
        setProServices(servicios);
  
        // Obtener citas reales del backend
        const citasResponse = await fetch(`http://localhost:8080/api/citas/prestador/${user.id}`);
        if (!citasResponse.ok) throw new Error("Error al obtener citas");
        const citas = await citasResponse.json();
  
        // Obtener detalles de servicio y cliente 
        const citasConDetalles = await Promise.all(
          citas.map(async (cita) => {
            // Detalles del servicio
            const resServicio = await fetch(`http://localhost:8080/api/servicios/${cita.idServicio}`);
            const servicio = await resServicio.json();
  
            // Detalles del cliente
            const clienteRes = await fetch(`http://localhost:8080/api/usuarios/id/${cita.idBuscador}`);
            const cliente = await clienteRes.json();
  
            return {
              ...cita,
              serviceDetails: {
                title: servicio.nombre,
                image: servicio.foto || "/placeholder.svg"
              },
              cliente: cliente,
            };
          })
        );
  
        // Clasificar por estado
        const pendientes = citasConDetalles.filter(c => c.estado === "Pendiente");
        const completadas = citasConDetalles.filter(c => c.estado === "Completada");
  
        // Actualizar estado
        setProBookings({
          upcoming: pendientes,
          completed: completadas,
        });
  
      } catch (error) {
        console.error("Error al cargar datos del prestador:", error);
      }
    }
  };
  
  
  

  useEffect(() => {
    loadProData();
  }, [user]);

  // Función para mostrar el modal de confirmación de eliminación
  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  // Función para confirmar la eliminación del servicio
  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await fetch(`http://localhost:8080/api/servicios/eliminar/${serviceToDelete.id}`, {
          method: "DELETE",
        });
        setServiceToDelete(null);
        setShowDeleteModal(false);
        loadProData(); 
      } catch (error) {
        console.error("Error al eliminar el servicio:", error);
      }
    }
  };


  if (!user) {
    return <Navigate to="/login" />;
  }


  if (user.rol !== "PRESTADOR") {
    return <Navigate to="/user-dashboard" />;
  }
  

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <img

                  src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=0D8ABC&color=fff`}
                  alt={user.nombre}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user.nombre}</h1>
                  <p className="text-gray-600">{user.correo}</p>
                  <p className="text-gray-600">{Array.isArray(user.categoria) ? user.categoria.join(", ") : "Sin categoría"}</p>

                </div>
              </div>
              <Link to="/create-service" className="btn-primary">
                Añadir Nuevo Servicio
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="border-b mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("services")}
                  className={`pb-4 px-1 ${
                    activeTab === "services"
                      ? "border-b-2 border-green-500 text-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Mis Servicios
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`pb-4 px-1 ${
                    activeTab === "bookings"
                      ? "border-b-2 border-green-500 text-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Citas Programadas
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`pb-4 px-1 ${
                    activeTab === "history"
                      ? "border-b-2 border-green-500 text-green-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Historial
                </button>
              </nav>
            </div>

            {activeTab === "services" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Mis Servicios</h2>

                {proServices.length > 0 ? (
                  <div className="space-y-4">
                    {proServices.map((service) => (

                    <div
                      key={service.id}
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start mb-4 md:mb-0">
                      <img
                        src={service.foto || "/placeholder.svg"}
                        alt={service.nombre}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                        <div>
                          <h3 className="font-semibold">{service.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            Categoría: {service.categoria}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            ${service.precio}/hora
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
                          onClick={() => handleDeleteService(service)}
                        >
                          Eliminar
                        </button>
                        <Link
                          to={`/edit-service/${service.id}`}
                          className="btn-secondary text-sm"
                        >
                          Editar
                        </Link>
                        <Link
                          to={`/service/${service.id}`}
                          className="btn-primary text-sm"
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  ))}

                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No tienes servicios publicados.
                    </p>
                    <Link
                      to="/create-service"
                      className="text-green-600 font-medium hover:underline mt-2 inline-block"
                    >
                      Añadir un servicio
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Citas Programadas
                </h2>

                {proBookings.upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {proBookings.upcoming.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <img
                            src={
                              booking.serviceDetails?.image ||
                              "/placeholder.svg"
                            }
                            alt={booking.serviceDetails?.title}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                          <div>

                            <h3 className="font-semibold">{booking.serviceDetails.title}</h3>
                            <div className="flex items-center space-x-2">
                              <img
                                src={booking.cliente?.imagen || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.cliente?.nombre || "Cliente")}&background=0D8ABC&color=fff`}
                                alt={booking.cliente?.nombre || "Cliente"}
                                className="w-8 h-8 rounded-full"
                              />
                              <p className="text-sm text-gray-600">Cliente: {booking.cliente?.nombre}</p>
                            </div>
                            <div className="flex items-center mt-1">
                              <svg
                                className="w-4 h-4 text-gray-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>

                              <span className="text-sm text-gray-600">{booking.fecha}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <svg
                                className="w-4 h-4 text-gray-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>

                              <span className="text-sm text-gray-600">{booking.hora}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="btn-secondary text-sm">
                            Reprogramar
                          </button>
                          <button className="btn-primary text-sm">
                            Contactar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No tienes citas programadas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Historial de Servicios
                </h2>

                {proBookings.completed.length > 0 ? (
                  <div className="space-y-4">
                    {proBookings.completed.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start mb-4 md:mb-0">
                          <img
                            src={
                              booking.serviceDetails?.image ||
                              "/placeholder.svg"
                            }
                            alt={booking.serviceDetails?.title}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                          <div>

                            <h3 className="font-semibold">{booking.serviceDetails.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <img
                                src={
                                  booking.cliente?.imagen ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    booking.cliente?.nombre || "Cliente"
                                  )}&background=0D8ABC&color=fff`
                                }
                                alt={booking.cliente?.nombre || "Cliente"}
                                className="w-8 h-8 rounded-full"
                              />
                              <p className="text-sm text-gray-600">
                                Cliente: {booking.cliente?.nombre}
                              </p>
                            </div>
                            <div className="flex items-center mt-1">
                              <svg
                                className="w-4 h-4 text-gray-500 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>

                              <span className="text-sm text-gray-600">{booking.fecha}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-sm text-green-600 font-medium">
                                Completado
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {booking.reviewed ? (
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < 5
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                Reseña recibida
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Sin reseña
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No tienes servicios completados.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar servicio */}
      {showDeleteModal && (
        <ConfirmationModal
          title="Eliminar servicio"
          message={`¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete?.title}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, eliminar"
          cancelText="No, cancelar"
          onConfirm={confirmDeleteService}
          onCancel={() => setShowDeleteModal(false)}
          isDestructive={true}
        />
      )}
    </div>


    {/* Modal de confirmación de eliminación */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-lg font-semibold mb-4">¿Eliminar servicio?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Esta acción no se puede deshacer. ¿Estás seguro que deseas eliminar el servicio <strong>{serviceToDelete?.nombre}</strong>?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteService}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ProDashboard;
