package com.conectados.conect.servicio.services.impl;

import com.conectados.conect.servicio.entities.Dto.ResenaDto;
import com.conectados.conect.servicio.entities.Resena;
import com.conectados.conect.servicio.entities.Servicio;
import com.conectados.conect.servicio.repositories.ResenaRepository;
import com.conectados.conect.servicio.repositories.ServicioRepository;
import com.conectados.conect.servicio.services.ResenaServices;
import com.conectados.conect.user.model.Usuario;
import com.conectados.conect.user.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResenaServicesImpl implements ResenaServices {

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public ResenaDto crearResena(Resena resena) {
        Optional<Servicio> servicioOpt = servicioRepository.findById(resena.getServicio().getId());
        Optional<Usuario> buscadorOpt = usuarioRepository.findById(resena.getBuscador().getId());
        Optional<Usuario> prestadorOpt = usuarioRepository.findById(resena.getPrestador().getId());

        if (servicioOpt.isPresent() && buscadorOpt.isPresent() && prestadorOpt.isPresent()) {
            resena.setServicio(servicioOpt.get());
            resena.setBuscador(buscadorOpt.get());
            resena.setPrestador(prestadorOpt.get());

            Resena guardada = resenaRepository.save(resena);
            return ResenaDto.fromEntity(guardada);
        }

        throw new RuntimeException("Entidad relacionada no encontrada");
    }



    @Override
    public Resena obtenerResenaPorId(Long id) {
        return resenaRepository.findById(id).orElse(null);
    }

    @Override
    public List<Resena> obtenerTodasLasResenas() {
        return resenaRepository.findAll();
    }

    @Override
    public List<Resena> obtenerResenasPorServicio(Servicio servicio) {
        return resenaRepository.findByServicio(servicio);
    }

    @Override
    public Resena actualizarResena(Long id, Resena resena) {
        Optional<Resena> existente = resenaRepository.findById(id);
        if (existente.isPresent()) {
            Resena r = existente.get();
            r.setComentario(resena.getComentario());
            r.setFecha(resena.getFecha());
            r.setValoracion(resena.getValoracion());
            return resenaRepository.save(r);
        }
        return null;
    }

    @Override
    public void eliminarResena(Long id) {
        resenaRepository.deleteById(id);
    }
}