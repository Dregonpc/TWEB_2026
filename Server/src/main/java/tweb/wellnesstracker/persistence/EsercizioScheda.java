package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "esercizi_scheda")
public class EsercizioScheda {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "nome_esercizio", nullable = false)
    private String nomeEsercizio;

    @Column(name = "serie")
    private Integer serie;

    @Column(name = "ripetizioni")
    private Integer ripetizioni;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "scheda_allenamento_id", nullable = false)
    private SchedaAllenamento schedaAllenamento;

    public EsercizioScheda() {}

    public EsercizioScheda(String nomeEsercizio, Integer serie, Integer ripetizioni, String note, SchedaAllenamento schedaAllenamento) {
        this.nomeEsercizio = nomeEsercizio;
        this.serie = serie;
        this.ripetizioni = ripetizioni;
        this.note = note;
        this.schedaAllenamento = schedaAllenamento;
    }

    public Long getId() { return id; }
    public String getNomeEsercizio() { return nomeEsercizio; }
    public Integer getSerie() { return serie; }
    public Integer getRipetizioni() { return ripetizioni; }
    public String getNote() { return note; }
    public SchedaAllenamento getSchedaAllenamento() { return schedaAllenamento; }

    public void setId(Long id) { this.id = id; }
    public void setNomeEsercizio(String nomeEsercizio) { this.nomeEsercizio = nomeEsercizio; }
    public void setSerie(Integer serie) { this.serie = serie; }
    public void setRipetizioni(Integer ripetizioni) { this.ripetizioni = ripetizioni; }
    public void setNote(String note) { this.note = note; }
    public void setSchedaAllenamento(SchedaAllenamento schedaAllenamento) { this.schedaAllenamento = schedaAllenamento; }
}