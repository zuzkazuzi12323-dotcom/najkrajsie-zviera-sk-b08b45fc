import { Link } from "react-router-dom";
import { Heart, PawPrint } from "lucide-react";
import sample1 from "@/assets/sample-dog-1.jpg";
import sample2 from "@/assets/sample-dog-2.jpg";
import sample3 from "@/assets/sample-dog-3.jpg";
import sample4 from "@/assets/sample-dog-4.jpg";

const samples = [
  { img: sample1, name: "Ryšo", breed: "Zlatý retríver · 3 roky" },
  { img: sample2, name: "Bruno", breed: "Jazvečík · 2 roky" },
  { img: sample3, name: "Perla", breed: "Kríženec · 4 roky" },
  { img: sample4, name: "Fifo", breed: "Border kólia · 1 rok" },
];

/** Ilustračné karty, ktoré sa zobrazia keď v súťaži ešte nie sú žiadni psi. */
const SampleDogCards = ({ priceLabel }: { priceLabel: string }) => (
  <div>
    <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-6 animate-soft-bounce">
      Toto môže byť tvoj pes! 👇
    </p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {samples.map((s, i) => (
        <div
          key={s.name}
          className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in"
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={s.img}
              alt={`Ilustračná fotka psa ${s.name}`}
              width={640}
              height={640}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-foreground/70 backdrop-blur-sm text-background text-[10px] font-semibold">
              Ukážka
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-bold text-card-foreground truncate">{s.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{s.breed}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3 text-primary" />
              <span className="tabular-nums font-medium">? hlasov</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="text-center mt-8">
      <Link
        to="/pridat"
        className="inline-flex items-center gap-2 gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden text-lg transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
      >
        <PawPrint className="w-5 h-5" /> Pridať psa ({priceLabel})
      </Link>
    </div>
  </div>
);

export default SampleDogCards;
