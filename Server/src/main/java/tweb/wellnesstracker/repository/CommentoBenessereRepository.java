package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.CommentoBenessere;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentoBenessereRepository extends JpaRepository<CommentoBenessere, Long> {
    List<CommentoBenessere> findByLogBenessereId(Long logBenessereId);
    List<CommentoBenessere> findByPsicologoId(Long psicologoId);
    void  deleteByLogBenessereId(Long logBenessereId);
}