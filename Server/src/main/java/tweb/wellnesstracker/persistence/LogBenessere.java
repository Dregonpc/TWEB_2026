package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "log_benessere")
public class LogBenessere {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "livello_umore")
    private Integer livelloUmore;

    @Column(name = "livello_sonno")
    private Integer livelloSonno;

    @Column(name = "livello_stress")
    private Integer livelloStress;

    @Column(name = "note_diario")
    private String noteDiario;

    @ManyToOne
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    public LogBenessere() {}

    public LogBenessere(LocalDate data, Integer livelloUmore, Integer livelloSonno, Integer livelloStress, String noteDiario, Utente utente) {
        this.data = data;
        this.livelloUmore = livelloUmore;
        this.livelloSonno = livelloSonno;
        this.livelloStress = livelloStress;
        this.noteDiario = noteDiario;
        this.utente = utente;
    }

    public Long getId() { return id; }
    public LocalDate getData() { return data; }
    public Integer getLivelloUmore() { return livelloUmore; }
    public Integer getLivelloSonno() { return livelloSonno; }
    public Integer getLivelloStress() { return livelloStress; }
    public String getNoteDiario() { return noteDiario; }
    public Utente getUtente() { return utente; }

    public void setId(Long id) { this.id = id; }
    public void setData(LocalDate data) { this.data = data; }
    public void setLivelloUmore(Integer livelloUmore) { this.livelloUmore = livelloUmore; }
    public void setLivelloSonno(Integer livelloSonno) { this.livelloSonno = livelloSonno; }
    public void setLivelloStress(Integer livelloStress) { this.livelloStress = livelloStress; }
    public void setNoteDiario(String noteDiario) { this.noteDiario = noteDiario; }
    public void setUtente(Utente utente) { this.utente = utente; }
}