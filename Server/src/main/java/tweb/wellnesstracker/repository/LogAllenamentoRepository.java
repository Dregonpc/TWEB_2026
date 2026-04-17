package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.LogAllenamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogAllenamentoRepository extends JpaRepository<LogAllenamento, Long> {
    List<LogAllenamento> findByUtenteId(Long utenteId);
    List<LogAllenamento> findByUtenteIdOrderByDataDesc(Long utenteId);
}