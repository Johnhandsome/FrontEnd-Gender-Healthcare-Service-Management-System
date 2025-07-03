export interface Blog {
  id: number;
  title: string;
  author: string;
  desc: string;
  content: string;
  img: string;
  createdAt: string;
  category: string;
  tags: string[];
}

export const BLOGS: Blog[] = [
  {
    id: 1,
    title: 'Gen Z & Safe Space: Chuyện Không Của Riêng Ai',
    author: 'Linh Tran',
    desc: 'Làm sao để xây dựng cộng đồng an toàn cho mọi người, đặc biệt là Gen Z?',
    content: 'Full story... (show ở detail page)',
    img: './Content.png',
    createdAt: '2025-06-12T08:00:00Z',
    category: 'Community',
    tags: ['community', 'safe space', 'youth'],
  },
  {
    id: 2,
    title: 'Chữa Lành Với Âm Nhạc: Playlist Xoa Dịu Tâm Hồn',
    author: 'An Nguyen',
    desc: 'Playlist chill cho những ngày stress, giúp Gen Z cân bằng cảm xúc.',
    content: 'Những bài hát nên nghe khi cảm thấy mọi thứ quá tải...',
    img: './Content.png',
    createdAt: '2025-06-10T15:21:00Z',
    category: 'Mental Health',
    tags: ['music', 'mental health', 'chill'],
  },
  {
    id: 3,
    title: 'Tips Tự Tin Coming Out Với Gia Đình',
    author: 'Bao Han',
    desc: 'Một vài tips nhỏ cho các bạn muốn come out với người thân mà không áp lực.',
    content:
      'Kể chuyện lần đầu come out và những điều mình ước đã biết sớm hơn...',
    img: './Content.png',
    createdAt: '2025-06-08T09:33:00Z',
    category: 'Gender Stories',
    tags: ['coming out', 'family', 'lgbtq+'],
  },
  {
    id: 4,
    title: '5 Bộ Phim Gen Z Nên Xem Một Lần Trong Đời',
    author: 'Tien Minh',
    desc: 'Tổng hợp 5 phim xuất sắc về đa dạng giới, tuổi trẻ và tự do sống thật.',
    content:
      'Review phim nhẹ nhàng, không spoil, dành cho bạn cần động lực sống thật...',
    img: './Content.png',
    createdAt: '2025-06-07T20:47:00Z',
    category: 'Education',
    tags: ['movies', 'recommendation', 'lifestyle'],
  },
  {
    id: 5,
    title: 'Legal 101: Quyền Lợi Của Bạn Khi Là LGBTQ+ Ở Việt Nam',
    author: 'Mai Phuong',
    desc: 'Các quyền hợp pháp và bảo vệ mà Gen Z LGBTQ+ cần biết.',
    content:
      'Phân tích dễ hiểu các quyền về pháp lý, support và hotline cần nhớ...',
    img: './Content.png',
    createdAt: '2025-06-05T12:00:00Z',
    category: 'Legal',
    tags: ['legal', 'rights', 'lgbtq+'],
  },
  {
    id: 6,
    title: 'Mental Detox: Một Ngày Không Mạng Xã Hội',
    author: 'Minh Khoa',
    desc: 'Thử detox social media 24h, cảm giác như nào và kết quả ra sao?',
    content:
      'Mình đã "cai" TikTok, Insta 1 ngày như nào và nhận ra gì về bản thân...',
    img: './Content.png',
    createdAt: '2025-06-03T10:12:00Z',
    category: 'Mental Health',
    tags: ['detox', 'mental health', 'self-care'],
  },
  {
    id: 7,
    title: 'Gen Z & Cyberbullying: Phòng Tránh Và Đối Mặt',
    author: 'Lan Anh',
    desc: 'Cyberbullying có thể khiến bạn stress nặng. Đây là cách mình vượt qua.',
    content: 'Câu chuyện thật và các hotline, support group Gen Z nên biết...',
    img: './Content.png',
    createdAt: '2025-06-02T08:55:00Z',
    category: 'Community',
    tags: ['cyberbullying', 'community', 'support'],
  },
  {
    id: 8,
    title: 'Làm Thế Nào Để Support Bạn Bè LGBTQ+?',
    author: 'Huy Vo',
    desc: 'Bạn thân come out? Làm gì để trở thành người bạn hiểu ý, không toxic?',
    content:
      'Những điều nhỏ nhặt giúp bạn bè LGBTQ+ cảm thấy được chấp nhận...',
    img: './Content.png',
    createdAt: '2025-06-01T19:00:00Z',
    category: 'Community',
    tags: ['support', 'friendship', 'lgbtq+'],
  },
  {
    id: 9,
    title: 'Checklist Chuẩn Bị Cho Pride Month',
    author: 'Quang Bao',
    desc: 'Những thứ bạn nên chuẩn bị cho Pride Month: từ outfit đến tâm lý!',
    content: 'Làm sao để enjoy Pride hết nấc mà không bị quá tải cảm xúc...',
    img: './Content.png',
    createdAt: '2025-05-29T13:45:00Z',
    category: 'Community',
    tags: ['pride', 'event', 'lgbtq+'],
  },
  {
    id: 10,
    title: 'Nhật Ký Gen Z: Một Ngày Đi Tư Vấn Tâm Lý',
    author: 'Phuc Dang',
    desc: 'Góc trải nghiệm thật về lần đầu đi gặp chuyên gia tâm lý.',
    content:
      'Chia sẻ thực tế không màu mè về quá trình tìm support và kết quả nhận lại...',
    img: './Content.png',
    createdAt: '2025-05-26T11:17:00Z',
    category: 'Mental Health',
    tags: ['mental health', 'psychology', 'gen z'],
  },
  {
    id: 11,
    title: 'Edu TikTok: Tìm Gì Để Học, Để Không Bị “Ngáo” Thông Tin?',
    author: 'Kim Yen',
    desc: 'Tips chọn lọc content học online an toàn, tránh fake news trên TikTok.',
    content:
      'List kênh TikTok, YouTube uy tín Gen Z nên follow để update kiến thức...',
    img: './Content.pngx',
    createdAt: '2025-05-25T09:34:00Z',
    category: 'Education',
    tags: ['education', 'tiktok', 'content'],
  },
];
