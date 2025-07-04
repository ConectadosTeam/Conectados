"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const EditServicePage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    precio: "",
    zonaAtencion: "",
    foto: "" 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "Limpieza", name: "Limpieza" },
    { id: "Electricidad", name: "Electricidad" },
    { id: "Plomería", name: "Plomería" },
    { id: "Jardinería", name: "Jardinería" },
    { id: "Peluquería", name: "Peluquería" },
    { id: "Carpintería", name: "Carpintería" },
  ];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/servicios/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el servicio");

        const data = await response.json();

        // Verifica si el prestador del servicio corresponde al usuario activo
        if (data.prestador?.id !== user?.id || user.rolActivo !== "PRESTADOR") {
          navigate("/pro-dashboard");
          return;
        }

        setFormData({
          nombre: data.nombre,
          categoria: data.categoria,
          descripcion: data.descripcion,
          precio: data.precio.toString(),
          zonaAtencion: data.zonaAtencion,
          foto: data.foto || ""
        });
        setImagePreview(data.foto || null);
        
      } catch (err) {
        console.error(err);
        navigate("/pro-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          foto: reader.result
        }));
        setImageFile(file);
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.categoria) newErrors.categoria = "Debes seleccionar una categoría";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!formData.precio || isNaN(formData.precio) || Number(formData.precio) <= 0) newErrors.precio = "Precio inválido";
    if (!formData.zonaAtencion) newErrors.zonaAtencion = "Debes seleccionar una zona de atención";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...formData,
        precio: parseFloat(formData.precio),
      };

      const response = await fetch(`http://localhost:8080/api/servicios/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Error al actualizar servicio");
      navigate("/pro-dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.rolActivo !== "PRESTADOR") {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Cargando datos del servicio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Editar Servicio</h1>
            <p className="text-gray-600">Actualiza la información de tu servicio</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6" aria-label="Formulario de edición de servicio">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Título del servicio *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`input-field ${errors.nombre ? "border-red-500" : ""}`}
              />
              {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`input-field ${errors.categoria ? "border-red-500" : ""}`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>}
            </div>

            <div>
              <label htmlFor="zonaAtencion" className="block text-sm font-medium text-gray-700">Zona de atención *</label>
              <select
                id="zonaAtencion"
                name="zonaAtencion"
                value={formData.zonaAtencion}
                onChange={handleChange}
                className={`input-field ${errors.zonaAtencion ? "border-red-500" : ""}`}
              >
                <option value="">Selecciona una región</option>
                <option value="Arica y Parinacota">Arica y Parinacota</option>
                <option value="Tarapacá">Tarapacá</option>
                <option value="Antofagasta">Antofagasta</option>
                <option value="Atacama">Atacama</option>
                <option value="Coquimbo">Coquimbo</option>
                <option value="Valparaíso">Valparaíso</option>
                <option value="Región Metropolitana">Región Metropolitana</option>
                <option value="O’Higgins">O’Higgins</option>
                <option value="Maule">Maule</option>
                <option value="Ñuble">Ñuble</option>
                <option value="Biobío">Biobío</option>
                <option value="La Araucanía">La Araucanía</option>
                <option value="Los Ríos">Los Ríos</option>
                <option value="Los Lagos">Los Lagos</option>
                <option value="Aysén">Aysén</option>
                <option value="Magallanes">Magallanes</option>
              </select>
              {errors.zonaAtencion && <p className="text-sm text-red-600 mt-1">{errors.zonaAtencion}</p>}
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                className={`input-field ${errors.descripcion ? "border-red-500" : ""}`}
              />
              {errors.descripcion && <p className="text-sm text-red-600 mt-1">{errors.descripcion}</p>}
            </div>

            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio por hora (CLP) *</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`input-field ${errors.precio ? "border-red-500" : ""}`}
                min="0"
              />
              {errors.precio && <p className="text-sm text-red-600 mt-1">{errors.precio}</p>}
            </div>

            <div>
              <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">Imagen del servicio</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="foto"
                  name="foto"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="foto"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cambiar imagen
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {imageFile ? imageFile.name : "Usar imagen actual"}
                </span>
              </div>
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => navigate("/pro-dashboard")} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditServicePage;
