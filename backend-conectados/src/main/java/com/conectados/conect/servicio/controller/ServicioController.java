package com.conectados.conect.servicio.controller;

import com.conectados.conect.servicio.entities.Dto.ServicioDto;
import com.conectados.conect.servicio.entities.Servicio;
import com.conectados.conect.servicio.services.ServicioServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.conectados.conect.user.repository.UsuarioRepository; 
import org.springframework.web.bind.annotation.*;
import com.conectados.conect.user.model.Usuario;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin("*")
public class ServicioController {

    @Autowired
    private ServicioServices servicioService;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @PostMapping("/crear")
    public ResponseEntity<Servicio> crearServicio(@RequestBody Servicio servicio) {
        return ResponseEntity.ok(servicioService.crearServicio(servicio));
    }



    @GetMapping("/{id}")
    public ResponseEntity<ServicioDto> obtenerServicioPorId(@PathVariable Long id) {
        Servicio servicio = servicioService.obtenerServicioPorId(id);
        return servicio != null
                ? ResponseEntity.ok(ServicioDto.fromEntity(servicio))
                : ResponseEntity.notFound().build();
    }


    @GetMapping("/todos")
    public ResponseEntity<List<ServicioDto>> obtenerTodos() {
        List<Servicio> servicios = servicioService.obtenerTodosLosServicios();
        return ResponseEntity.ok(ServicioDto.fromEntityList(servicios));
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<ServicioDto> actualizarServicio(@PathVariable Long id, @RequestBody ServicioDto servicioDto) {
        Servicio servicioExistente = servicioService.obtenerServicioPorId(id);

        if (servicioExistente == null) {
            return ResponseEntity.notFound().build();
        }

        // Solo actualizamos los campos relevantes
        servicioExistente.setNombre(servicioDto.getNombre());
        servicioExistente.setPrecio(servicioDto.getPrecio());
        servicioExistente.setZonaAtencion(servicioDto.getZonaAtencion());
        servicioExistente.setCategoria(servicioDto.getCategoria());
        servicioExistente.setFoto(servicioDto.getFoto());

        servicioExistente.setDescripcion(servicioDto.getDescripcion());

        Servicio actualizado = servicioService.actualizarServicio(id, servicioExistente);
        return ResponseEntity.ok(ServicioDto.fromEntity(actualizado));
    }


    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioService.eliminarServicio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ServicioDto>> obtenerPorCategoria(@PathVariable String categoria) {
        List<Servicio> servicios = servicioService.obtenerServiciosPorCategoria(categoria);
        return ResponseEntity.ok(ServicioDto.fromEntityList(servicios));
    }

    @GetMapping("/prestador/{id}")
    public ResponseEntity<List<ServicioDto>> obtenerPorPrestadorId(@PathVariable Long id) {
        List<Servicio> servicios = servicioService.obtenerServiciosPorPrestadorId(id);
        return ResponseEntity.ok(ServicioDto.fromEntityList(servicios));
    }
}