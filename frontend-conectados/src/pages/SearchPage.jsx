"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ServiceCard from "../components/ServiceCard";

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";
  const initialCategory = queryParams.get("category") || "";

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(
    "Todas las categorías"
  );
  const [filteredServices, setFilteredServices] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  // 1. Nuevo estado para la opción de ordenación
  const [sortOption, setSortOption] = useState("rating"); // Valor por defecto: Mejor valorados

  const categories = [
    { id: "all", name: "Todas las categorías" },
    { id: "Limpieza", name: "Limpieza" },
    { id: "Electricidad", name: "Electricidad" },
    { id: "Plomería", name: "Plomería" },
    { id: "Jardinería", name: "Jardinería" },
    { id: "Peluquería", name: "Peluquería" },
    { id: "Carpintería", name: "Carpintería" },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("q") || "";
    setSearchTerm(query);
  }, [location.search]);

  // Cargar servicios desde el backend y aplicar filtros/ordenación
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/servicios/todos"
        );
        if (!response.ok) throw new Error("Error al obtener los servicios");

        const data = await response.json();
        let results = [...data];

        // Filtrar por término de búsqueda
        if (searchTerm) {
          results = results.filter(
            (service) =>
              service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              service.descripcion
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        // Filtrar por categoría (solo si no es "Todas las categorías")
        if (selectedCategory && selectedCategory !== "Todas las categorías") {
          results = results.filter(
            (service) =>
              service.categoria?.toLowerCase() ===
              selectedCategory.toLowerCase()
          );
        }

        // Filtrar por rango de precio
        results = results.filter(
          (service) =>
            service.precio >= priceRange[0] && service.precio <= priceRange[1]
        );

        // 3. Aplicar lógica de ordenación
        let sortedResults = [...results]; // Crear una copia para ordenar

        switch (sortOption) {
          case "rating":
            // Ordenar por valoración promedio (mayor a menor)
            sortedResults.sort(
              (a, b) =>
                (b.valoracionPromedio || 0) - (a.valoracionPromedio || 0)
            );
            break;
          case "price-asc":
            // Ordenar por precio (menor a mayor)
            sortedResults.sort((a, b) => a.precio - b.precio);
            break;
          case "price-desc":
            // Ordenar por precio (mayor a menor)
            sortedResults.sort((a, b) => b.precio - a.precio);
            break;
          default:
            // No hacer nada si la opción no es reconocida (o puedes definir un orden por defecto)
            break;
        }

        setFilteredServices(sortedResults); // Actualizar con los servicios ya ordenados
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
    };

    fetchServices();
  }, [searchTerm, selectedCategory, priceRange, sortOption]); // Añadir sortOption a las dependencias del useEffect

  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda ya se maneja a través del useEffect cuando searchTerm cambia.
    // Aquí podrías agregar lógica adicional si el submit del formulario lo requiere.
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handlePriceChange = (e) => {
    const value = Number.parseInt(e.target.value);
    const isMin = e.target.id === "min-price";

    setPriceRange((prev) => {
      if (isMin) {
        return [value, prev[1]];
      } else {
        return [prev[0], value];
      }
    });
  };

  // 2. Nuevo manejador para el cambio en la opción de ordenación
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Buscar Servicios
        </h1>

        <div className="mb-8 flex justify-center">
          <SearchBar
            className="w-full max-w-3xl"
            initialValue={searchTerm}
            onSearch={(value) => setSearchTerm(value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>

            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Categoría
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="input-field"
              >
                <option value="Todas las categorías">
                  Todas las categorías
                </option>
                {categories
                  .filter((cat) => cat.name !== "Todas las categorías")
                  .map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Precio por hora
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="min-price"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Mínimo
                  </label>
                  <input
                    type="number"
                    id="min-price"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={handlePriceChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="max-price"
                    className="block text-xs text-gray-500 mb-1"
                  >
                    Máximo
                  </label>
                  <input
                    type="number"
                    id="max-price"
                    min={priceRange[0]}
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory("Todas las categorías");
                setPriceRange([0, 10000]); // Ajustado a 10000 para que coincida con el valor inicial
                setSearchTerm("");
                setSortOption("rating"); // Resetear también la opción de ordenación
              }}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredServices.length} resultados encontrados
              </p>
              <select
                className="border border-gray-300 rounded-md text-sm p-2"
                value={sortOption} // Asociar el valor con el estado sortOption
                onChange={handleSortChange} // Asignar el nuevo manejador de eventos
              >
                <option value="rating">Ordenar por: Mejor valorados</option>
                <option value="price-asc">Precio: Menor a mayor</option>
                <option value="price-desc">Precio: Mayor a menor</option>
              </select>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">
                  No se encontraron servicios que coincidan con tu búsqueda.
                </p>
                <p className="text-gray-500 mt-2">
                  Intenta con otros términos o filtros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
