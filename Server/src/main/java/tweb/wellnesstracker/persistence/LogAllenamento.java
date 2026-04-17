package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "log_allenamenti")
public class LogAllenamento {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    public LogAllenamento() {}

    public LogAllenamento(LocalDate data, String note, Utente utente) {
        this.data = data;
        this.note = note;
        this.utente = utente;
    }

    public Long getId() { return id; }
    public LocalDate getData() { return data; }
    public String getNote() { return note; }
    public Utente getUtente() { return utente; }

    public void setId(Long id) { this.id = id; }
    public void setData(LocalDate data) { this.data = data; }
    public void setNote(String note) { this.note = note; }
    public void setUtente(Utente utente) { this.utente = utente; }
}