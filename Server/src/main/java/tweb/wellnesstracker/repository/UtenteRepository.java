package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.Utente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UtenteRepository extends JpaRepository<Utente, Long> {
    Optional<Utente> findByUsername(String username);
    List<Utente> findByRuolo(String ruolo);
}