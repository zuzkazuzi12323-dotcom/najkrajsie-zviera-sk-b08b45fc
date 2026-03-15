import dog1 from "@/assets/dog1.jpg";
import dog2 from "@/assets/dog2.jpg";
import dog3 from "@/assets/dog3.jpg";
import dog4 from "@/assets/dog4.jpg";
import dog5 from "@/assets/dog5.jpg";
import dog6 from "@/assets/dog6.jpg";

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  description: string;
  image: string;
  votes: number;
  highlighted: boolean;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  dogId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export const mockDogs: Dog[] = [
  {
    id: "1",
    name: "Luna",
    breed: "Sibírsky husky",
    age: "2 roky",
    description: "Luna je energická a hravá husky, ktorá miluje dlhé prechádzky v prírode a sneh.",
    image: dog1,
    votes: 342,
    highlighted: true,
    ownerId: "u1",
    ownerName: "Mária K.",
    createdAt: "2025-03-01",
  },
  {
    id: "2",
    name: "Bruno",
    breed: "Francúzsky buldoček",
    age: "3 roky",
    description: "Bruno je pokojný spoločník, ktorý sa najradšej túli na gauči. Miluje maškrty a krátke prechádzky.",
    image: dog2,
    votes: 287,
    highlighted: false,
    ownerId: "u2",
    ownerName: "Peter N.",
    createdAt: "2025-03-05",
  },
  {
    id: "3",
    name: "Rex",
    breed: "Border kólia",
    age: "4 roky",
    description: "Rex je neuveriteľne inteligentný pes, ktorý ovláda viac ako 20 trikov. Je šampión v agility.",
    image: dog3,
    votes: 456,
    highlighted: true,
    ownerId: "u3",
    ownerName: "Jana S.",
    createdAt: "2025-02-20",
  },
  {
    id: "4",
    name: "Buddy",
    breed: "Labrador retriever",
    age: "6 mesiacov",
    description: "Buddy je roztomilé šteniatko, ktoré práve objavuje svet. Každý deň je pre neho dobrodružstvo.",
    image: dog4,
    votes: 521,
    highlighted: false,
    ownerId: "u4",
    ownerName: "Tomáš B.",
    createdAt: "2025-03-10",
  },
  {
    id: "5",
    name: "Max",
    breed: "Nemecký ovčiak",
    age: "5 rokov",
    description: "Max je verný strážca a najlepší priateľ celej rodiny. Miluje deti a hranie sa s loptou.",
    image: dog5,
    votes: 398,
    highlighted: false,
    ownerId: "u5",
    ownerName: "Lucia M.",
    createdAt: "2025-02-28",
  },
  {
    id: "6",
    name: "Bella",
    breed: "Bígl",
    age: "1 rok",
    description: "Bella je zvedavá a veselá bíglička s nezameniteľným pohľadom. Všade strká svoj nosík.",
    image: dog6,
    votes: 275,
    highlighted: false,
    ownerId: "u6",
    ownerName: "Martin D.",
    createdAt: "2025-03-08",
  },
];

export const mockComments: Comment[] = [
  { id: "c1", dogId: "1", userId: "u2", userName: "Peter N.", text: "Nádherná husky! 😍", createdAt: "2025-03-12" },
  { id: "c2", dogId: "1", userId: "u3", userName: "Jana S.", text: "Tie oči sú úžasné!", createdAt: "2025-03-13" },
  { id: "c3", dogId: "3", userId: "u1", userName: "Mária K.", text: "Rex je fantastický! Koľko trvalo naučiť ho tie triky?", createdAt: "2025-03-11" },
  { id: "c4", dogId: "4", userId: "u6", userName: "Martin D.", text: "Také roztomilé šteniatko ❤️", createdAt: "2025-03-14" },
  { id: "c5", dogId: "2", userId: "u1", userName: "Mária K.", text: "Bruno vyzerá ako malý gentleman!", createdAt: "2025-03-09" },
  { id: "c6", dogId: "5", userId: "u4", userName: "Tomáš B.", text: "Krásny nemecký ovčiak!", createdAt: "2025-03-07" },
];
