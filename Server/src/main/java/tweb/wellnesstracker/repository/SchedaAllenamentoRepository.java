package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.SchedaAllenamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchedaAllenamentoRepository extends JpaRepository<SchedaAllenamento, Long> {
    List<SchedaAllenamento> findByUtenteId(Long utenteId);
    List<SchedaAllenamento> findByCoachId(Long coachId);
}