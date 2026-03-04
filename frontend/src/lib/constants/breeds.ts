// breeds.ts — 로컬 견종 데이터 리스트 (DANG-ONB-001)

export interface Breed {
  id: string;
  name: string;
  enName: string;
  category: 'small' | 'medium' | 'large';
}

export const BREEDS: Breed[] = [
  { id: 'maltese', name: '말티즈', enName: 'Maltese', category: 'small' },
  { id: 'poodle_toy', name: '토이 푸들', enName: 'Toy Poodle', category: 'small' },
  { id: 'pomeranian', name: '포메라니안', enName: 'Pomeranian', category: 'small' },
  { id: 'shih_tzu', name: '시츄', enName: 'Shih Tzu', category: 'small' },
  { id: 'yorkshire_terrier', name: '요크셔 테리어', enName: 'Yorkshire Terrier', category: 'small' },
  { id: 'chihuahua', name: '치와와', enName: 'Chihuahua', category: 'small' },
  { id: 'bichon_frise', name: '비숑 프리제', enName: 'Bichon Frise', category: 'small' },
  { id: 'poodle_mini', name: '미니어처 푸들', enName: 'Miniature Poodle', category: 'small' },
  { id: 'welsh_corgi', name: '웰시 코기', enName: 'Welsh Corgi', category: 'medium' },
  { id: 'shiba_inu', name: '시바 이누', enName: 'Shiba Inu', category: 'medium' },
  { id: 'beagle', name: '비글', enName: 'Beagle', category: 'medium' },
  { id: 'cocker_spaniel', name: '코카 스파니엘', enName: 'Cocker Spaniel', category: 'medium' },
  { id: 'french_bulldog', name: '프렌치 불독', enName: 'French Bulldog', category: 'medium' },
  { id: 'jindo_dog', name: '진돗개', enName: 'Jindo Dog', category: 'medium' },
  { id: 'spitz', name: '스피츠', enName: 'Spitz', category: 'medium' },
  { id: 'golden_retriever', name: '골든 리트리버', enName: 'Golden Retriever', category: 'large' },
  { id: 'labrador_retriever', name: '래브라도 리트리버', enName: 'Labrador Retriever', category: 'large' },
  { id: 'samoyed', name: '사모예드', enName: 'Samoyed', category: 'large' },
  { id: 'siberian_husky', name: '시베리안 허스키', enName: 'Siberian Husky', category: 'large' },
  { id: 'border_collie', name: '보더 콜리', enName: 'Border Collie', category: 'large' },
  { id: 'dobermann', name: '도베르만', enName: 'Dobermann', category: 'large' },
  { id: 'dalmatian', name: '달마시안', enName: 'Dalmatian', category: 'large' },
  { id: 'mixed', name: '믹스견', enName: 'Mixed Breed', category: 'medium' },
];
