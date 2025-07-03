// src/app/data/services.mock.ts

export interface GenderService {
  id: number;
  name: string;
  desc: string;
  category: string;
  img: string;
  price: string;
}

export const GENDER_SERVICES: GenderService[] = [
  {
    id: 1,
    name: 'Hormone Therapy Counseling',
    desc: 'Consultation about hormone therapy options, risks, and benefits, tailored to your identity.',
    category: 'Gender Support',
    img: 'letan.png',
    price: '300,000đ',
  },
  {
    id: 2,
    name: 'Mental Health Counseling',
    desc: 'Psychological support sessions for mental health and gender-related challenges.',
    category: 'Mental Health',
    img: 'letan.png',
    price: '250,000đ',
  },
  {
    id: 3,
    name: 'Routine Health Screening',
    desc: 'Annual check-up service for monitoring general and gender-related health metrics.',
    category: 'Lab Test',
    img: 'letan.png',
    price: '350,000đ',
  },
  {
    id: 4,
    name: 'STD/STI Testing & Counseling',
    desc: 'Confidential screening and counseling for sexually transmitted infections.',
    category: 'Lab Test',
    img: 'letan.png',
    price: '400,000đ',
  },
  {
    id: 5,
    name: 'Legal Gender Change Support',
    desc: 'Guidance and paperwork assistance for legal name/gender change processes.',
    category: 'Legal Support',
    img: 'letan.png',
    price: 'Free consultation',
  },
  {
    id: 6,
    name: 'Voice Therapy Training',
    desc: 'Professional voice training to help transgender clients match their gender identity.',
    category: 'Gender Support',
    img: 'letan.png',
    price: '450,000đ',
  },
  {
    id: 7,
    name: 'Peer Support Group',
    desc: 'Weekly community support group meetings in a safe and inclusive space.',
    category: 'Mental Health',
    img: 'letan.png',
    price: 'Free',
  },
  {
    id: 8,
    name: 'Pre-surgery Consultation',
    desc: 'Preparation and Q&A for those considering gender-affirming surgery.',
    category: 'Gender Support',
    img: 'letan.png',
    price: '400,000đ',
  },
  {
    id: 9,
    name: 'Trans Health Education Workshop',
    desc: 'Educational workshops for clients and families about transgender health and rights.',
    category: 'Education',
    img: 'letan.png',
    price: '200,000đ',
  },
  {
    id: 10,
    name: 'PrEP & HIV Prevention Counseling',
    desc: 'Consultation about PrEP and other HIV prevention options for the LGBTQ+ community.',
    category: 'Lab Test',
    img: 'letan.png',
    price: '350,000đ',
  },
  {
    id: 11,
    name: 'Relationship & Sexual Health Counseling',
    desc: 'Private sessions for questions about relationships and sexual health for all genders.',
    category: 'Mental Health',
    img: 'letan.png',
    price: '300,000đ',
  },
  {
    id: 12,
    name: 'Fertility & Family Planning',
    desc: 'Information and counseling for fertility preservation and family planning options.',
    category: 'Gender Support',
    img: 'letan.png',
    price: '500,000đ',
  },
];
