package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "commenti_benessere")
public class CommentoBenessere {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "testo", nullable = false)
    private String testo;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Utente psicologo;

    @ManyToOne
    @JoinColumn(name = "log_benessere_id", nullable = false)
    private LogBenessere logBenessere;

    public CommentoBenessere() {}

    public CommentoBenessere(String testo, LocalDate data, Utente psicologo, LogBenessere logBenessere) {
        this.testo = testo;
        this.data = data;
        this.psicologo = psicologo;
        this.logBenessere = logBenessere;
    }

    public Long getId() { return id; }
    public String getTesto() { return testo; }
    public LocalDate getData() { return data; }
    public Utente getPsicologo() { return psicologo; }
    public LogBenessere getLogBenessere() { return logBenessere; }

    public void setId(Long id) { this.id = id; }
    public void setTesto(String testo) { this.testo = testo; }
    public void setData(LocalDate data) { this.data = data; }
    public void setPsicologo(Utente psicologo) { this.psicologo = psicologo; }
    public void setLogBenessere(LogBenessere logBenessere) { this.logBenessere = logBenessere; }
}