package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.Dieta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DietaRepository extends JpaRepository<Dieta, Long> {
    List<Dieta> findByUtenteId(Long utenteId);
    List<Dieta> findByCoachId(Long coachId);
}