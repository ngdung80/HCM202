import React, { useState, useEffect, useRef } from 'react';

// ===========================================================================================
// ÂM THANH 8-BIT TỰ TẠO (WEB AUDIO API)
// ===========================================================================================
class SoundFX {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  play(type) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const play1 = (freq, dur, type = 'sine', vol = 0.04) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.connect(g); g.connect(this.ctx.destination);
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(vol, now);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.stop(now + dur);
    };
    try {
      if (type === 'click')   play1(600, 0.08, 'sine', 0.02);
      if (type === 'correct') { play1(523, 0.15); play1(659, 0.15); play1(783, 0.2); }
      if (type === 'wrong')   play1(150, 0.3, 'sawtooth', 0.05);
      if (type === 'level-win') [261,329,392,523].forEach((f,i) => setTimeout(() => play1(f,0.3),i*100));
      if (type === 'victory') [261,329,392,523,392,523,659,783].forEach((f,i) => setTimeout(() => play1(f,0.35),i*100));
      if (type === 'gameover') play1(200, 0.7, 'triangle', 0.05);
    } catch(e) {}
  }
}
const sfx = new SoundFX();

// ===========================================================================================
// NHẠC NỀN – dùng file /music.mp3 trong public/
// (quản lý bằng useRef trong component App)
// ===========================================================================================

// ===========================================================================================
// DATABASE – CÂU HỎI & DỮ LIỆU TỪ GIÁO TRÌNH HCM202
// ===========================================================================================
// ── MÀN 1: 20 câu hỏi trắc nghiệm ──────────────────────────────────────────
const ALL_Q1 = [
  {
    q: "Trong tác phẩm 'Sửa đổi lối làm việc' (1947), Chủ tịch Hồ Chí Minh đã ví đạo đức cách mạng đối với con người như yếu tố nào của cây và sông?",
    opts: ["Là hoa quả của cây và dòng chảy của sông","Là cành lá của cây và là phù sa của sông","Là gốc của cây và nguồn của sông","Là thân cây và đáy sông"],
    ans: 2, exp: "Đạo đức cách mạng là GỐC của cây và NGUỒN của sông – Bác nhấn mạnh đạo đức là nền tảng căn bản, không thể thiếu của người cách mạng."
  },
  {
    q: "Theo tư tưởng Hồ Chí Minh, ý nghĩa sâu sắc nhất của câu nói 'Hiểu chủ nghĩa Mác–Lênin là phải sống với nhau có tình có nghĩa' là gì?",
    opts: ["Người học lý luận chính trị cần ghi nhớ nhiều kiến thức","Đạo đức cách mạng phải được thể hiện bằng hành động và cách đối xử với con người","Chỉ cần sống tình cảm là đủ để trở thành người cách mạng","Người có học thức cao sẽ tự có đạo đức tốt"],
    ans: 1, exp: "Bác nhấn mạnh lý luận phải gắn với thực tiễn – đạo đức cách mạng không chỉ là nhận thức mà phải được thể hiện qua hành động và ứng xử thực tế."
  },
  {
    q: "Theo tư tưởng Hồ Chí Minh, đâu là biểu hiện đúng của tinh thần 'Cần và Kiệm' đối với sinh viên hiện nay?",
    opts: ["Chỉ cần học giỏi, không cần quan tâm đến cách chi tiêu","Làm việc chăm chỉ nhưng tiêu xài thoải mái để hưởng thụ cuộc sống","Chủ động học tập, quản lý thời gian hợp lý và biết tiết kiệm, tránh lãng phí","Tiết kiệm tối đa bằng cách hạn chế tham gia mọi hoạt động xã hội"],
    ans: 2, exp: "Cần = chăm chỉ, sáng tạo trong học tập; Kiệm = tiết kiệm thời gian, tiền bạc, tránh xa hoa lãng phí – hai đức tính phải song hành."
  },
  {
    q: "Theo tư tưởng đạo đức của Hồ Chí Minh, hành động nào dưới đây thể hiện đầy đủ cả đức 'Liêm' và 'Chính'?",
    opts: ["Giúp bạn làm bài kiểm tra để giữ tình bạn","Im lặng khi thấy bạn gian lận để tránh mất đoàn kết","Trung thực trong học tập và thẳng thắn góp ý khi bạn mắc sai lầm","Chỉ tập trung học tốt mà không quan tâm đến hành vi sai trái xung quanh"],
    ans: 2, exp: "Liêm = trong sạch, không tham lam; Chính = thẳng thắn, không dung túng sai trái – cả hai thể hiện qua sự trung thực và can đảm góp ý."
  },
  {
    q: "Một sinh viên có lý tưởng cao đẹp nhưng liên tục bỏ bê việc học dẫn đến nợ môn. Dưới góc nhìn 'Thống nhất nhân cách' của Hồ Chí Minh, sinh viên này đang vi phạm biểu hiện nào?",
    opts: ["Có Đức thiếu Tài – Dù có lòng tốt nhưng thiếu năng lực thực tiễn thì không thể đóng góp thực chất","Có Tài thiếu Đức – Vì không hoàn thành trách nhiệm học tập","Hoàn toàn vô dụng – Vì không đem lại bất kỳ giá trị kinh tế nào","Không vi phạm – Vì trách nhiệm xã hội luôn được ưu tiên hơn kết quả học tập"],
    ans: 0, exp: "Có Đức mà thiếu Tài: Dù lý tưởng tốt nhưng thiếu năng lực chuyên môn (nợ môn, không tốt nghiệp) thì không thể phụng sự đất nước một cách thực chất."
  },
  {
    q: "Nội dung 'trung với nước, hiếu với dân' của Hồ Chí Minh kế thừa từ truyền thống nào của dân tộc?",
    opts: ["Tôn sư trọng đạo","Uống nước nhớ nguồn","Trung quân ái quốc và yêu thương nhân dân","Đoàn kết quốc tế"],
    ans: 2, exp: "Bác kế thừa và phát triển: 'trung' không còn là trung với vua mà là trung với nước, 'hiếu' không chỉ với cha mẹ mà là hiếu với toàn dân tộc."
  },
  {
    q: "Một trong những nguyên tắc quan trọng bậc nhất trong xây dựng đạo đức cách mạng theo quan điểm Hồ Chí Minh là?",
    opts: ["Nói đi đôi với làm, nêu gương về đạo đức","Xây đi đôi với chống","Cần, kiệm, liêm, chính, chí công vô tư","Trung với nước, hiếu với dân"],
    ans: 0, exp: "Nói đi đôi với làm – nêu gương về đạo đức là nguyên tắc hàng đầu: người cán bộ phải hành động đúng với những gì mình tuyên truyền."
  },
  {
    q: "Vì sao Hồ Chí Minh cho rằng 'chí công vô tư' là điều kiện quan trọng để xây dựng bộ máy trong sạch, vững mạnh?",
    opts: ["'Chí công vô tư' tạo ra nguồn động lực chính giúp phát triển kinh tế giàu mạnh","'Chí công vô tư' góp phần ngăn chặn chủ nghĩa cá nhân, tham nhũng và quan liêu","'Chí công vô tư' giúp tạo môi trường nâng cao các kỹ năng chuyên môn","'Chí công vô tư' chỉ cần thiết với người lãnh đạo cấp cao"],
    ans: 1, exp: "Chí công vô tư là liều thuốc chống lại chủ nghĩa cá nhân – kẻ thù nguy hiểm nhất của sự nghiệp cách mạng, giúp bộ máy nhà nước trong sạch, phục vụ nhân dân."
  },
  {
    q: "Đối tượng nghiên cứu của môn học Tư tưởng Hồ Chí Minh là gì?",
    opts: ["Hệ thống quan điểm, lý luận về cách mạng Việt Nam qua thực tiễn","Tiểu sử và lịch sử biên niên của gia đình Hồ Chí Minh","Quá trình xây dựng kinh tế thị trường định hướng XHCN","Các học thuyết triết học phương Tây thời Phục Hưng"],
    ans: 0, exp: "Đối tượng là toàn bộ hệ thống quan điểm lý luận về cách mạng Việt Nam, được hình thành và kiểm nghiệm qua thực tiễn hoạt động của Người."
  },
  {
    q: "Nguồn gốc lý luận quyết định bước chuyển về chất trong tư tưởng cứu nước của Hồ Chí Minh?",
    opts: ["Chủ nghĩa Mác - Lênin","Nho giáo và Phật giáo Á Đông","Phong trào dân chủ tư sản Việt Nam","Các giá trị Cách mạng Mỹ và Pháp"],
    ans: 0, exp: "Chủ nghĩa Mác-Lênin chính là nguồn gốc trực tiếp và quyết định, đưa Bác từ chủ nghĩa yêu nước tiến lên lập trường cộng sản vô sản."
  },
  {
    q: "Hồ Chí Minh ra đi tìm đường cứu nước vào năm nào và từ đâu?",
    opts: ["Năm 1911 từ Bến Nhà Rồng, Sài Gòn","Năm 1908 từ Huế, Trung Kỳ","Năm 1919 từ Paris, Pháp","Năm 1924 từ Quảng Châu, Trung Quốc"],
    ans: 0, exp: "Ngày 5/6/1911, Nguyễn Tất Thành rời bến cảng Nhà Rồng (Sài Gòn) trên con tàu Amiral Latouche-Tréville để bắt đầu hành trình tìm đường cứu nước."
  },
  {
    q: "Theo Hồ Chí Minh, muốn cứu nước và giải phóng dân tộc, không có con đường nào khác ngoài con đường nào?",
    opts: ["Con đường cách mạng vô sản","Con đường cải lương tư sản","Con đường dựa vào đế quốc Mỹ","Con đường phong kiến tiến bộ"],
    ans: 0, exp: "Người khẳng định: 'Muốn cứu nước và giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản.'"
  },
];

// ── MÀN 2: 8 mốc lịch sử, mỗi lần chơi dùng 5 ─────────────────────────────
const ALL_TIMELINE = [
  { id: 'e1', year: 1890, text: "Nguyễn Sinh Cung (Hồ Chí Minh) ra đời tại làng Kim Liên, Nam Đàn, Nghệ An." },
  { id: 'e2', year: 1905, text: "Nguyễn Tất Thành bắt đầu học tại Trường Quốc học Huế, tiếp thu tư tưởng yêu nước." },
  { id: 'e3', year: 1911, text: "Nguyễn Tất Thành rời Bến Nhà Rồng (Sài Gòn) ra đi tìm đường cứu nước." },
  { id: 'e4', year: 1919, text: "Nguyễn Ái Quốc gửi bản 'Yêu sách của nhân dân An Nam' đến Hội nghị Versailles." },
  { id: 'e5', year: 1920, text: "Nguyễn Ái Quốc đọc Luận cương Lênin và bỏ phiếu tán thành lập Đảng Cộng sản Pháp tại Đại hội Tua." },
  { id: 'e6', year: 1925, text: "Thành lập Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu, Trung Quốc." },
  { id: 'e7', year: 1930, text: "Chủ trì hội nghị hợp nhất ba tổ chức cộng sản, thành lập Đảng Cộng sản Việt Nam tại Hương Cảng." },
  { id: 'e8', year: 1941, text: "Vượt biên giới Việt – Trung về nước, lãnh đạo cách mạng tại hang Pác Bó, Cao Bằng." },
  { id: 'e9', year: 1945, text: "Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam DCCH." },
  { id: 'ea', year: 1946, text: "Chủ tịch Hồ Chí Minh ký Hiến pháp đầu tiên của nước Việt Nam DCCH." },
  { id: 'eb', year: 1969, text: "Chủ tịch Hồ Chí Minh qua đời, để lại Di chúc lịch sử cho toàn Đảng, toàn dân." }
];

// ── MÀN 3: 3 bộ lắp ghép xoay vòng ─────────────────────────────────────────
const ALL_PUZZLES = [
  {
    src: "Sửa đổi lối làm việc (1947)",
    template: "Đảng không phải là một tổ chức để làm {b0}. Nó phải làm tròn nhiệm vụ {b1}, làm cho Tổ quốc giàu mạnh, đồng bào sung sướng. Mỗi đảng viên và cán bộ phải thật sự {b2} đạo đức cách mạng, thật sự cần kiệm liêm chính, chí công {b3}.",
    blanks: { b0: "quan phát tài", b1: "giải phóng dân tộc", b2: "thấm nhuần", b3: "vô tư" },
    wordBank: ["quan phát tài","giải phóng dân tộc","thấm nhuần","vô tư","thăng quan tiến chức","giải phóng giai cấp","học tập lý luận","tư lợi cá nhân"]
  },
  {
    src: "Di chúc (1969)",
    template: "Điều mong muốn cuối cùng của tôi là: Toàn Đảng, toàn dân ta đoàn kết {b0}, đấu tranh {b1} và {b2}, xây dựng một nước Việt Nam {b3} và hạnh phúc.",
    blanks: { b0: "phấn đấu", b1: "anh dũng", b2: "bền bỉ", b3: "hòa bình, thống nhất, độc lập, dân chủ" },
    wordBank: ["phấn đấu","anh dũng","bền bỉ","hòa bình, thống nhất, độc lập, dân chủ","kiên quyết","đoàn kết","vững vàng","giàu mạnh, văn minh"]
  },
  {
    src: "Đường Kách Mệnh (1927)",
    template: "{b0} phải hi sinh ít lòng {b1} mà làm việc cho {b2}. Khi không có gì, thì không sao; có rồi thì phải {b3} hơn lúc trước.",
    blanks: { b0: "Cách mạng", b1: "tư riêng", b2: "chung", b3: "trong sạch" },
    wordBank: ["Cách mạng","tư riêng","chung","trong sạch","Đảng viên","công khai","tập thể","kiên quyết"]
  }
];

// ── MÀN 4: 12 boss statements ────────────────────────────────────────────────
const ALL_BOSS_Q = [
  { stmt: "Tư tưởng Hồ Chí Minh là sao chép máy móc chủ nghĩa Mác-Lênin vào Việt Nam.", isTrue: false, exp: "Sai! Tư tưởng Hồ Chí Minh là sự kết hợp sáng tạo Mác-Lênin với tinh hoa dân tộc và thực tiễn cách mạng Việt Nam." },
  { stmt: "Đại đoàn kết toàn dân tộc là vấn đề chiến lược quyết định thành bại của cách mạng.", isTrue: true, exp: "Đúng! Khẩu hiệu: 'Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.'" },
  { stmt: "Theo Hồ Chí Minh, con người chỉ là công cụ phục vụ mục tiêu kinh tế của nhà nước.", isTrue: false, exp: "Sai! Người coi con người vừa là mục tiêu tối thượng giải phóng, vừa là động lực to lớn của cách mạng." },
  { stmt: "Chủ nghĩa cá nhân theo Hồ Chí Minh là kẻ thù nguy hiểm nhất của công cuộc xây dựng CNXH.", isTrue: true, exp: "Đúng! Người coi chủ nghĩa cá nhân như vi trùng độc hại, là 'giặc nội xâm' nguy hiểm." },
  { stmt: "Nhà nước theo Hồ Chí Minh mang bản chất giai cấp công nhân, có tính nhân dân và dân tộc sâu sắc.", isTrue: true, exp: "Đúng! Nhà nước của dân, do dân và vì dân là luận điểm nhất quán của Người." },
  { stmt: "Hồ Chí Minh cho rằng cách mạng giải phóng dân tộc phải chờ cách mạng vô sản ở chính quốc thắng lợi trước.", isTrue: false, exp: "Sai! Đây là luận điểm sáng tạo: cách mạng thuộc địa có thể nổ ra và thắng lợi trước, không thụ động chờ đợi." },
  { stmt: "Theo Hồ Chí Minh, văn hóa là lĩnh vực thứ yếu, phụ thuộc hoàn toàn vào kinh tế và chính trị.", isTrue: false, exp: "Sai! Người đặt văn hóa ngang tầm với kinh tế, chính trị, quân sự: 'Văn hóa soi đường quốc dân đi.'" },
  { stmt: "Hồ Chí Minh coi tự phê bình và phê bình là quy luật phát triển của Đảng.", isTrue: true, exp: "Đúng! Người coi tự phê bình và phê bình là vũ khí sắc bén để Đảng tự làm sạch và hoàn thiện mình." },
  { stmt: "Trong tư tưởng Hồ Chí Minh, liên minh công - nông - trí thức là nền tảng của khối đại đoàn kết.", isTrue: true, exp: "Đúng! Liên minh công - nông - trí thức là hạt nhân của Mặt trận đoàn kết toàn dân tộc." },
  { stmt: "Hồ Chí Minh cho rằng 'có tài mà không có đức là người vô dụng'.", isTrue: true, exp: "Đúng! Câu nói nổi tiếng của Người nhấn mạnh đức là gốc, tài phải đi liền với đức mới hoàn thiện." },
  { stmt: "Theo Hồ Chí Minh, nền văn hóa mới Việt Nam phải rập khuôn hoàn toàn theo mô hình văn hóa Liên Xô.", isTrue: false, exp: "Sai! Người chủ trương nền văn hóa Việt Nam phải có tính dân tộc, khoa học, đại chúng – kế thừa truyền thống và tiếp thu tinh hoa nhân loại." },
  { stmt: "Hồ Chí Minh xác định: 'Nước ta là nước dân chủ – bao nhiêu lợi ích đều vì dân, bao nhiêu quyền hạn đều của dân'.", isTrue: true, exp: "Đúng! Tư tưởng dân chủ xuyên suốt: Nhà nước XHCN phải thực sự là nhà nước của dân, do dân, vì dân." }
];

// ===========================================================================================
// UTILITY FUNCTIONS
// ===========================================================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Trộn ngẫu nhiên và chọn N phần tử từ pool
function pickQuestions(pool, n) {
  return shuffle([...pool]).slice(0, Math.min(n, pool.length));
}

// Chọn 5 sự kiện ngẫu nhiên từ ALL_TIMELINE và sắp xếp tăng dần theo năm
function pickTimeline() {
  return shuffle([...ALL_TIMELINE]).slice(0, 5).sort((a, b) => a.year - b.year);
}

// ===========================================================================================
// STYLES – DESIGN SYSTEM
// ===========================================================================================
const S = {
  // Layout
  screen: { display:'flex', flexDirection:'column', gap:20, animation:'fadeUp 0.4s ease forwards' },
  // Colors
  gold: '#f59e0b',
  goldLight: '#fcd34d',
  red: '#ef4444',
  emerald: '#10b981',
  // Backgrounds
  cardDark: { background:'rgba(15,10,5,0.7)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20 },
  cardGold: { background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:20 },
  cardRed: { background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:20 },
  cardGreen: { background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:20 },
};

// ===========================================================================================
// APP ROOT
// ===========================================================================================
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [screen, setScreen]   = useState('welcome');
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);
  const [musicOn, setMusicOn] = useState(false);
  const [musicHover, setMusicHover] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const toggleMusic = () => {
    sfx.play('click');
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio.play().catch(() => {});
      setMusicOn(true);
    }
  };

  const goLevel = (next, bonus = 0) => {
    sfx.play('level-win');
    setScore(p => p + bonus);
    setScreen(next);
  };
  const gameOver = () => { sfx.play('gameover'); setScreen('gameover'); };
  const victory  = (bonus = 0) => {
    sfx.play('victory');
    setScore(p => p + bonus);
    setScreen('victory');
  };
  const restart = () => {
    sfx.play('click');
    setScore(0); setLives(3);
    setScreen('level1');
  };

  const inGame = ['level1','level2','level3','level4'].includes(screen);

  return (
    <>
    {showIntro && <IntroPopup onClose={() => setShowIntro(false)} onStartMusic={() => {
      const audio = audioRef.current;
      if (audio && !musicOn) {
        audio.play().catch(() => {});
        setMusicOn(true);
      }
    }} />}
    <div style={{
      height:'100vh', width:'100%',
      backgroundImage: "url('/backgroundV2.jpg')",
      backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed',
      display:'flex', alignItems:'stretch', justifyContent:'center',
      padding:'10px', position:'relative', overflow:'hidden', fontFamily:"'Inter', sans-serif"
    }}>
      {/* Overlay tối để giữ tính đọc được của nội dung */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(160deg, rgba(4,6,12,0.55) 0%, rgba(8,6,4,0.50) 50%, rgba(12,4,4,0.60) 100%)',
      }} />
      {/* ─── NÚT NHẠC NỀN – góc trên phải ─────────────────────────────── */}
      <button
        id="music-toggle-btn"
        title={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        onMouseEnter={() => setMusicHover(true)}
        onMouseLeave={() => setMusicHover(false)}
        onClick={toggleMusic}
        style={{
          position:'fixed', top:18, right:18, zIndex:99999,
          width:48, height:48,
          borderRadius:'50%',
          border: musicOn
            ? '1.5px solid rgba(245,158,11,0.6)'
            : '1.5px solid rgba(255,255,255,0.12)',
          background: musicHover
            ? (musicOn ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)')
            : (musicOn ? 'rgba(245,158,11,0.12)' : 'rgba(0,0,0,0.55)'),
          backdropFilter:'blur(12px)',
          cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20,
          transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          transform: musicHover ? 'scale(1.12)' : 'scale(1)',
          boxShadow: musicOn
            ? '0 0 18px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.6)'
            : '0 4px 16px rgba(0,0,0,0.5)',
          animation: musicOn ? 'musicPulse 2s ease-in-out infinite' : 'none',
          outline:'none',
        }}
      >
        {musicOn ? '🎵' : '🔇'}
      </button>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>
        <div style={{ position:'absolute', top:'5%', left:'5%', width:500, height:500, background:'radial-gradient(circle, rgba(127,29,29,0.2) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'5%', right:'5%', width:600, height:600, background:'radial-gradient(circle, rgba(120,90,10,0.12) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      {/* Main card */}
      <div style={{
        width:'100%', maxWidth:1200, flex:1, position:'relative', zIndex:10,
        background:'rgba(10,8,5,0.55)', border:'1px solid rgba(255,255,255,0.13)',
        borderRadius:24, padding:'32px 56px',
        backdropFilter:'blur(20px) saturate(1.6) brightness(1.1)',
        boxShadow:'0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        display:'flex', flexDirection:'column', gap:24, overflow:'auto'
      }}>
        {/* HEADER */}
        <header style={{ textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:18 }}>
          <h1 style={{
            margin:0, fontSize:48, fontWeight:900, letterSpacing:7,
            background:'linear-gradient(135deg, #fcd34d 0%, #f59e0b 40%, #dc2626 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', textTransform:'uppercase',
            fontFamily:"'Cinzel', serif", lineHeight:1.1
          }}>
            Chiến Binh Tư Tưởng
          </h1>
          <p style={{ margin:'8px 0 0', fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:4, textTransform:'uppercase', fontFamily:'monospace' }}>
            ⚔️ HCM202 · INTERACTIVE ARENA ⚔️
          </p>
        </header>

        {/* HUD BAR */}
        {inGame && (
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)',
            borderRadius:14, padding:'10px 18px', fontSize:12, fontFamily:'monospace'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:2 }}>MÀN:</span>
              <span style={{ color:S.gold, fontWeight:700 }}>
                {screen==='level1' && '⚔️  1 – CÔNG THÀNH'}
                {screen==='level2' && '⏳  2 – DÒNG THỜI GIAN'}
                {screen==='level3' && '📜  3 – LẮP GHÉP'}
                {screen==='level4' && '👹  4 – BOSS FIGHT'}
              </span>
            </div>
            <div style={{ display:'flex', gap:20, alignItems:'center' }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:2 }}>ĐIỂM:</span>
                <span style={{
                  color:S.gold, fontWeight:900, fontSize:16,
                  background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)',
                  padding:'2px 10px', borderRadius:8
                }}>{String(score).padStart(4,'0')}</span>
              </div>
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:2 }}>MẠNG:</span>
                {[0,1,2].map(i => (
                  <span key={i} style={{ fontSize:16, opacity: i < lives ? 1 : 0.2, transition:'opacity 0.3s' }}>❤️</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREENS */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          {screen === 'welcome'  && <WelcomeScreen onStart={() => { sfx.play('click'); setScreen('level1'); }} />}
          {screen === 'level1'   && <Level1 onWin={s => goLevel('level2',s)} onLose={gameOver} lives={lives} setLives={setLives} />}
          {screen === 'level2'   && <Level2 onWin={s => goLevel('level3',s)} onLose={gameOver} lives={lives} setLives={setLives} />}
          {screen === 'level3'   && <Level3 onWin={s => goLevel('level4',s)} onLose={gameOver} lives={lives} setLives={setLives} />}
          {screen === 'level4'   && <Level4 onWin={s => victory(s)} onLose={gameOver} lives={lives} setLives={setLives} />}
          {screen === 'victory'  && <VictoryScreen  score={score} onRestart={restart} />}
          {screen === 'gameover' && <GameOverScreen score={score} onRestart={restart} />}
        </main>

        <footer style={{ 
          textAlign:'center', 
          fontSize:14, 
          fontWeight: 800,
          borderTop:'1px solid rgba(255,255,255,0.05)', 
          paddingTop:18, 
          letterSpacing:4, 
          textTransform:'uppercase', 
          fontFamily:"'Aptos', sans-serif",
          background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #ef4444 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.4))'
        }}>
          Không có gì quý hơn độc lập tự do
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes introPop { from { opacity:0; transform:scale(0.88) translateY(24px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes introFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes musicPulse { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.3),0 4px 16px rgba(0,0,0,0.6);} 50%{box-shadow:0 0 28px rgba(245,158,11,0.7),0 4px 20px rgba(0,0,0,0.6);} }
        @keyframes shimmerLine { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes starFloat { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-10px) rotate(180deg);} }
        @keyframes shakeFx { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes glowBoss { 0%,100%{filter:drop-shadow(0 0 8px rgba(239,68,68,0.4))} 50%{filter:drop-shadow(0 0 22px rgba(239,68,68,0.9))} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulsate { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes timerShrink { from{width:100%} to{width:0%} }
        @keyframes bombFly { 0%{transform:translate(0,0) scale(1); opacity:1;} 80%{transform:translate(var(--bx),var(--by)) scale(1.3); opacity:1;} 100%{transform:translate(var(--bx),var(--by)) scale(0); opacity:0;} }
        @keyframes explode { 0%{transform:scale(0); opacity:1;} 50%{transform:scale(2.5); opacity:0.9;} 100%{transform:scale(4); opacity:0;} }
        @keyframes castleShake { 0%,100%{transform:translateX(0) rotate(0deg);} 15%{transform:translateX(-10px) rotate(-2deg);} 30%{transform:translateX(8px) rotate(1deg);} 45%{transform:translateX(-6px) rotate(-1deg);} 60%{transform:translateX(6px) rotate(1deg);} 75%{transform:translateX(-4px) rotate(0deg);} }
        @keyframes castleCrumble { 0%{opacity:1; transform:scale(1);} 30%{opacity:0.7; transform:scale(1.05);} 60%{opacity:0.4; transform:scale(0.9) rotate(3deg);} 100%{opacity:0; transform:scale(0.5) rotate(8deg) translateY(20px);} }
        @keyframes attackFly { 0%{transform:translate(0,0) scale(1); opacity:1;} 100%{transform:translate(var(--ax),var(--ay)) scale(0.6); opacity:0;} }
        @keyframes crackAppear { from{opacity:0; transform:scale(0.5);} to{opacity:1; transform:scale(1);} }
        @keyframes coreFloat { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-6px) scale(1.05);} }
        @keyframes coreGlow { 0%,100%{box-shadow:0 0 12px var(--core-color,#fff);} 50%{box-shadow:0 0 28px var(--core-color,#fff), 0 0 50px var(--core-color,#fff);} }
        @keyframes overlayIn { from{opacity:0; transform:scale(0.85);} to{opacity:1; transform:scale(1);} }
        @keyframes starTwinkle { 0%,100%{opacity:0.8; transform:scale(1);} 50%{opacity:1; transform:scale(1.2); filter:drop-shadow(0 0 12px #fcd34d);} }
        @keyframes laserDraw { from{stroke-dashoffset: 100;} to{stroke-dashoffset: 0;} }
        @keyframes slotIn { 0%{transform:scale(1.5); opacity:0;} 100%{transform:scale(1); opacity:1;} }
        @keyframes flashRed { 0%,100%{background:transparent;} 50%{background:rgba(239,68,68,0.2);} }
        @keyframes slashFly { 0%{transform:translate(0,0) scale(0.5) rotate(45deg); opacity:0;} 20%{opacity:1;} 80%{transform:translate(180px,0) scale(1.5) rotate(45deg); opacity:1;} 100%{transform:translate(200px,0) scale(2) rotate(45deg); opacity:0;} }
        @keyframes orbFly { 0%{transform:translate(0,0) scale(0.5); opacity:0;} 20%{opacity:1;} 80%{transform:translate(-180px,0) scale(1.2); opacity:1;} 100%{transform:translate(-200px,0) scale(1.5); opacity:0;} }
        @keyframes floatTextUp { 0%{transform:translateY(10px) scale(0.8); opacity:0;} 20%{transform:translateY(0) scale(1.2); opacity:1;} 80%{transform:translateY(-30px) scale(1); opacity:1;} 100%{transform:translateY(-40px) scale(0.9); opacity:0;} }
        @keyframes diceRoll { 0%{transform:rotate(0deg) scale(1);} 25%{transform:rotate(90deg) scale(1.2);} 50%{transform:rotate(180deg) scale(0.9);} 75%{transform:rotate(270deg) scale(1.1);} 100%{transform:rotate(360deg) scale(1);} }
        @keyframes meteorShower { 0%{transform:translate(200px,-200px); opacity:0;} 20%{opacity:1;} 80%{transform:translate(-50px,100px); opacity:1;} 100%{transform:translate(-100px,150px); opacity:0;} }
        @keyframes fireRain { 0%{transform:translateY(-200px); opacity:0;} 50%{opacity:1;} 100%{transform:translateY(200px); opacity:0;} }
        @keyframes meteoriteDrop { 0%{transform:translateY(-300px) scale(1.5); opacity:0;} 20%{opacity:1;} 60%{transform:translateY(20px) scale(1.5); opacity:1;} 100%{transform:translateY(50px) scale(2); opacity:0;} }
        @keyframes dragonFly { 0%{transform:translate(-300px,0) scale(1.5); opacity:0;} 10%{opacity:1;} 90%{transform:translate(300px,0) scale(1.5); opacity:1;} 100%{transform:translate(400px,0) scale(1.5); opacity:0;} }
        @keyframes lightningStrike { 0%,100%{opacity:0; transform:scaleY(0);} 10%,30%,50%{opacity:1; transform:scaleY(1);} 20%,40%{opacity:0.2; transform:scaleY(1);} }
        .shake { animation: shakeFx 0.5s ease; }
        .castle-shake { animation: castleShake 0.6s ease; }
        .boss-glow { animation: glowBoss 1.5s ease-in-out infinite; }
        .boss-enraged { animation: glowBoss 0.5s ease-in-out infinite; filter: drop-shadow(0 0 20px #ef4444); }
        .float { animation: floatUp 2.5s ease-in-out infinite; }
        .pulse { animation: pulsate 1.2s ease-in-out infinite; }
        .pulse-fast { animation: pulsate 0.5s ease-in-out infinite; }
        .core-float { animation: coreFloat 2s ease-in-out infinite; }
        .core-glow { animation: coreGlow 2s ease-in-out infinite; }
        .star-twinkle { animation: starTwinkle 3s infinite ease-in-out; }
        .laser-line { stroke-dasharray: 100; animation: laserDraw 0.6s linear forwards; }
        .slot-in { animation: slotIn 0.3s cubic-bezier(.2,.8,.4,1); }
        .bg-flash-red { animation: flashRed 0.8s ease; }
        .dice-rolling { animation: diceRoll 0.4s linear infinite; }
        .meteor-1 { animation: meteorShower 0.5s forwards linear; }
        .meteor-2 { animation: meteorShower 0.6s forwards linear 0.1s; }
        .meteor-3 { animation: meteorShower 0.4s forwards linear 0.2s; }
        .fire-drop { animation: fireRain 0.6s forwards linear; }
        .meteorite-drop { animation: meteoriteDrop 0.8s forwards cubic-bezier(0.5,0,1,1); }
        .dragon-fly { animation: dragonFly 1.2s forwards ease-in-out; }
        .lightning-strike { animation: lightningStrike 0.6s forwards; transform-origin: top; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(245,158,11,0.3); border-radius:4px; }
      `}</style>
    </div>
    </>
  );
}

// ===========================================================================================
// INTRO POPUP
// ===========================================================================================
function IntroPopup({ onClose, onStartMusic }) {
  const [hovered, setHovered] = useState(false);
  const members = [
    'Nguyễn Hoàng Cường',
    'Nguyễn Lê Minh Châu',
    'Lê Trần Uyên Nhi',
    'Ngô Thị Thanh Hương',
    'Đàm Thị Phương Thảo',
    'Nguyễn Đức Dũng',
    'Phạm Thế Sơn',
    'Trần Linh Chi',
    'Trần Gia Kiên',
    'Dương Duy Phi',
  ];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      backgroundImage: "url('/backgroundV2.jpg')",
      backgroundSize:'cover', backgroundPosition:'center',
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'16px',
      animation:'introFadeIn 0.5s ease forwards',
      fontFamily:"'Inter', sans-serif",
      overflowY:'auto',
    }}>
      {/* Dark overlay trên background */}
      <div style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(160deg, rgba(2,4,10,0.60) 0%, rgba(6,4,2,0.55) 50%, rgba(10,2,2,0.65) 100%)',
      }} />
      {/* Ambient glow blobs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:500, height:500, background:'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:600, height:600, background:'radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', top:'40%', left:'50%', width:350, height:350, background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', borderRadius:'50%', transform:'translate(-50%,-50%)' }} />
      </div>

      {/* Main card */}
      <div style={{
        position:'relative', zIndex:10,
        background:'linear-gradient(160deg, rgba(14,11,8,0.45) 0%, rgba(20,14,10,0.55) 100%)',
        backdropFilter:'blur(20px) saturate(1.4)',
        border:'1px solid rgba(245,158,11,0.22)',
        borderRadius:28, padding:'32px 40px',
        maxWidth:760, width:'100%',
        margin:'auto',
        boxShadow:'0 40px 100px rgba(0,0,0,0.95), 0 0 80px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        animation:'introPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        {/* Top badge */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10,
            background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
            borderRadius:999, padding:'5px 16px', marginBottom:14,
          }}>
            <span style={{ fontSize:13 }}>🎓</span>
            <span style={{ fontSize:11, color:'rgba(245,158,11,0.8)', letterSpacing:3, fontFamily:'monospace', textTransform:'uppercase' }}>HCM202 · Nhóm 1</span>
          </div>

          {/* Title */}
          <h1 style={{
            margin:'0 0 4px', fontSize:28, fontWeight:900,
            fontFamily:"'Cinzel', serif", letterSpacing:3,
            background:'linear-gradient(135deg, #fcd34d 0%, #f59e0b 45%, #dc2626 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            lineHeight:1.15, textTransform:'uppercase',
          }}>Chiến Binh Tư Tưởng</h1>
          <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.25)', letterSpacing:3, textTransform:'uppercase', fontFamily:'monospace' }}>Interactive Learning Platform</p>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)', marginBottom:20 }} />

        {/* Two column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>

          {/* Mục tiêu */}
          <div style={{
            background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)',
            borderRadius:16, padding:'16px 18px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:18 }}>🎯</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#f59e0b', letterSpacing:2, textTransform:'uppercase' }}>Mục Tiêu Dự Án</span>
            </div>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.75 }}>
              Tạo ra một <strong style={{ color:'#fcd34d' }}>nền tảng học tập tương tác</strong> giúp sinh viên tiếp cận tư tưởng Hồ Chí Minh một cách <em>dễ dàng và thú vị hơn</em> thông qua trải nghiệm game hóa cao cấp.
            </p>
          </div>

          {/* Đối tượng */}
          <div style={{
            background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)',
            borderRadius:16, padding:'16px 18px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:18 }}>👥</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#818cf8', letterSpacing:2, textTransform:'uppercase' }}>Đối Tượng</span>
            </div>
            <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
              {[
                { icon:'📚', text:'Sinh viên học môn Tư tưởng HCM' },
                { icon:'🌟', text:'Người quan tâm đến tư tưởng cách mạng' },
                { icon:'📖', text:'Những ai muốn tìm hiểu lịch sử' },
              ].map((item, i) => (
                <li key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'rgba(255,255,255,0.6)' }}>
                  <span style={{ fontSize:13 }}>{item.icon}</span> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Thông tin nhóm */}
        <div style={{
          background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.14)',
          borderRadius:16, padding:'16px 18px', marginBottom:16,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>🏆</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#10b981', letterSpacing:2, textTransform:'uppercase' }}>Thông Tin Nhóm</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12 }}>
            {members.map((name, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:10, padding:'6px 14px',
                fontSize:12.5, color:'rgba(255,255,255,0.72)', fontWeight:500,
                transition:'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor='rgba(245,158,11,0.25)'; e.currentTarget.style.color='#fcd34d'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.72)'; }}
              >{name}</div>
            ))}
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.45)' }}>
              <span style={{ color:'rgba(255,255,255,0.25)' }}>Giảng viên: </span>
              <span style={{ color:'#fcd34d', fontWeight:600 }}>Đoàn Thị Vành Khuyên</span>
            </div>
            <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.45)' }}>
              <span style={{ color:'rgba(255,255,255,0.25)' }}>Nội dung: </span>
              <span style={{ color:'rgba(255,255,255,0.65)' }}>Giáo trình Tư tưởng Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        {/* Chúc mừng text */}
        <div style={{
          textAlign:'center', marginBottom:22,
          padding:'12px 20px',
          background:'linear-gradient(135deg, rgba(220,38,38,0.06), rgba(245,158,11,0.06))',
          border:'1px solid rgba(245,158,11,0.1)',
          borderRadius:14,
        }}>
          <p style={{ margin:0, fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.7, fontStyle:'italic' }}>
            ✨ <span style={{ color:'rgba(255,255,255,0.8)', fontWeight:500 }}>Chúc các bạn chơi game vui vẻ!</span> ✨<br/>
            <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.35)' }}>Hãy thử thách bản thân qua 4 màn học thuật đặc sắc</span>
          </p>
        </div>

        {/* Start button */}
        <div style={{ textAlign:'center' }}>
          <button
            id="intro-start-btn"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => { sfx.play('click'); onStartMusic && onStartMusic(); onClose(); }}
            style={{
              position:'relative', overflow:'hidden',
              background: hovered
                ? 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #b45309 0%, #991b1b 100%)',
              border:'none', borderRadius:14,
              padding:'15px 56px',
              fontSize:14, fontWeight:800, letterSpacing:4, textTransform:'uppercase',
              color:'#fff', cursor:'pointer', fontFamily:"'Cinzel', serif",
              transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              transform: hovered ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
              boxShadow: hovered
                ? '0 20px 50px rgba(245,158,11,0.45), 0 0 0 1px rgba(245,158,11,0.4)'
                : '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            {/* Shimmer effect */}
            {hovered && (
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                backgroundSize:'200% 100%',
                animation:'shimmerLine 0.7s linear',
                pointerEvents:'none',
              }} />
            )}
            ⚔️&nbsp; Bắt Đầu Chơi &nbsp;⚔️
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================================
// WELCOME SCREEN
// ===========================================================================================
function WelcomeScreen({ onStart }) {
  const levels = [
    { icon:'⚔️', num:'01', title:'Công Thành', desc:'Đánh bại thành lũy địch bằng trắc nghiệm chính xác.', color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.25)' },
    { icon:'⏳', num:'02', title:'Dòng Thời Gian', desc:'Sắp xếp mốc lịch sử cách mạng đúng thứ tự.', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.25)' },
    { icon:'📜', num:'03', title:'Lắp Ghép Chân Lý', desc:'Điền từ khóa vào văn kiện đạo đức của Bác.', color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.25)' },
    { icon:'👹', num:'04', title:'Boss Fight', desc:'Phán xét Đúng/Sai trong 5 giây, phản xạ tức thì.', color:'#a855f7', bg:'rgba(168,85,247,0.08)', border:'rgba(168,85,247,0.25)' },
  ];

  return (
    <div style={{ ...S.screen, alignItems:'center', textAlign:'center', padding:'16px 0', gap:28 }}>
      {/* Logo */}
      <div className="float" style={{ position:'relative', width:130, height:130 }}>
        <div style={{
          position:'absolute', inset:-6,
          background:'linear-gradient(135deg, #fcd34d, #f59e0b, #dc2626)',
          borderRadius:36, filter:'blur(20px)', opacity:0.75
        }} />
        <div style={{
          position:'relative', width:130, height:130,
          background:'linear-gradient(135deg, #1c1008, #2d1a06)',
          border:'1px solid rgba(245,158,11,0.4)', borderRadius:32,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:62
        }}>🛡️</div>
      </div>

      <div style={{ maxWidth:680 }}>
        <h2 style={{ margin:'0 0 14px', fontSize:36, fontWeight:800, color:'#f1f5f9', letterSpacing:1.5 }}>
          Bản Lĩnh Người Học Lịch Sử
        </h2>
        <p style={{ margin:0, fontSize:15.5, color:'rgba(255,255,255,0.45)', lineHeight:1.75, fontWeight:300 }}>
          Trải nghiệm 4 thử thách học thuật với cơ chế hoàn toàn khác biệt để nắm vững
          tinh hoa tư tưởng Hồ Chí Minh – môn HCM202.
        </p>
      </div>

      {/* Level cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:20, width:'100%', maxWidth:800 }}>
        {levels.map(lv => (
          <div key={lv.num} style={{
            background:lv.bg, border:`1px solid ${lv.border}`,
            borderRadius:20, padding:'22px 26px', textAlign:'left',
            transition:'transform 0.2s, box-shadow 0.2s', cursor:'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${lv.border}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
              <span style={{ fontSize:30 }}>{lv.icon}</span>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', letterSpacing:3 }}>MÀN {lv.num}</div>
                <div style={{ fontSize:16, fontWeight:700, color:lv.color }}>{lv.title}</div>
              </div>
            </div>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{lv.desc}</p>
          </div>
        ))}
      </div>

      <GlowButton onClick={onStart} color="#f59e0b" style={{ fontSize:15, padding:'18px 56px', letterSpacing:4 }}>
        BẮT ĐẦU CHINH PHỤC ➔
      </GlowButton>
    </div>
  );
}

// ===========================================================================================
// LEVEL 1 – CÔNG THÀNH CHIẾN (v2 – Castle Siege with FX)
// ===========================================================================================
const POWER_CORES = [
  { id:'heart',  icon:'❤️',  label:'Hồi Sinh',    desc:'+1 HP cho bên ta',              color:'#ef4444', glowColor:'rgba(239,68,68,0.6)'  },
  { id:'shield', icon:'🛡️',  label:'Khiên Thần',   desc:'Chắn 1 đòn địch tiếp theo',   color:'#3b82f6', glowColor:'rgba(59,130,246,0.6)' },
  { id:'power',  icon:'⚡',  label:'Sấm Sét',      desc:'Lần công tiếp -2 HP địch',    color:'#a855f7', glowColor:'rgba(168,85,247,0.6)' },
];

function BombProjectile({ active, fromLeft, onEnd }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onEnd, 900);
    return () => clearTimeout(t);
  }, [active]);
  if (!active) return null;
  return (
    <div style={{
      position:'absolute', top:'50%', zIndex:50, pointerEvents:'none',
      left: fromLeft ? '20%' : '75%',
      '--bx': fromLeft ? '55vw' : '-55vw',
      '--by': '-40px',
      animation:'bombFly 0.8s cubic-bezier(.2,.8,.4,1) forwards',
      fontSize:28,
    }}>💣</div>
  );
}

function ExplosionFX({ active, side }) {
  if (!active) return null;
  return (
    <div style={{
      position:'absolute', top:'30%',
      [side === 'right' ? 'right' : 'left']: '8%',
      zIndex:60, pointerEvents:'none',
      animation:'explode 0.6s ease-out forwards',
      fontSize:48,
    }}>💥</div>
  );
}

function CastleVisual({ hp, maxHp, label, side, isShaking, isExploding }) {
  const pct = hp / maxHp;
  const cracks = maxHp - hp;
  const isLeft = side === 'left';
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      alignItems: isLeft ? 'flex-start' : 'flex-end',
      gap:8, position:'relative', flex:1,
      padding:'12px 16px',
    }}>
      {/* Castle emoji with damage */}
      <div style={{
        position:'relative', display:'inline-block',
        animation: isShaking ? 'castleShake 0.6s ease' : isExploding ? 'castleCrumble 0.5s ease forwards' : 'none',
      }}>
        <span style={{
          fontSize:58,
          filter: `brightness(${0.5 + pct*0.5}) drop-shadow(0 0 ${pct>0.6?12:6}px ${isLeft ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'})`
        }}>{isLeft ? '🏯' : '🏰'}</span>
        {/* Crack indicators */}
        {cracks > 0 && Array.from({length: cracks}).map((_,i) => (
          <span key={i} style={{
            position:'absolute',
            top: `${15 + i*18}%`,
            left: isLeft ? `${60 + i*10}%` : `${-10 - i*10}%`,
            fontSize:14, animation:'crackAppear 0.3s ease',
            filter:'drop-shadow(0 0 4px rgba(239,68,68,0.8))'
          }}>💢</span>
        ))}
      </div>

      {/* Label & HP */}
      <div style={{ textAlign: isLeft ? 'left' : 'right' }}>
        <div style={{ fontSize:11, fontFamily:'monospace', letterSpacing:2, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:13, fontFamily:'monospace', color: isLeft ? '#10b981' : '#ef4444', fontWeight:700, marginTop:2 }}>HP: {hp} / {maxHp}</div>
      </div>

      {/* HP bar */}
      <div style={{ width:'100%', background:'rgba(0,0,0,0.5)', borderRadius:999, height:10, overflow:'hidden', border:`1px solid ${isLeft ? '#10b98133' : '#ef444433'}` }}>
        <div style={{
          height:'100%', borderRadius:999, transition:'width 0.5s cubic-bezier(.4,0,.2,1)',
          width:`${(hp/maxHp)*100}%`,
          background: isLeft
            ? 'linear-gradient(90deg, #10b981aa, #10b981)'
            : 'linear-gradient(90deg, #ef4444aa, #ef4444)',
          boxShadow: isLeft ? '0 0 10px #10b98177' : '0 0 10px #ef444477'
        }} />
      </div>
    </div>
  );
}

function CoreSelectOverlay({ onSelect }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.88)',
      display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(10px)',
    }}>
      <div style={{
        background:'rgba(15,10,5,0.97)',
        border:'1px solid rgba(245,158,11,0.35)',
        borderRadius:28, padding:'36px 42px',
        maxWidth:520, width:'90%',
        animation:'overlayIn 0.35s cubic-bezier(.2,.8,.4,1) forwards',
        boxShadow:'0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(245,158,11,0.08)'
      }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>⚗️</div>
          <h3 style={{
            margin:0, fontSize:20, fontWeight:900, letterSpacing:3, textTransform:'uppercase',
            background:'linear-gradient(135deg, #fcd34d, #f59e0b)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            fontFamily:"'Cinzel', serif"
          }}>Chọn Lõi Sức Mạnh</h3>
          <p style={{ margin:'10px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)', letterSpacing:1 }}>
            Hoàn thành 3 câu — hãy chọn 1 lõi để tăng cường sức chiến đấu!
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {POWER_CORES.map(core => (
            <button key={core.id}
              onMouseEnter={() => setHov(core.id)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onSelect(core)}
              style={{
                background: hov===core.id ? `rgba(${core.id==='heart'?'239,68,68':core.id==='shield'?'59,130,246':'168,85,247'},0.15)` : 'rgba(255,255,255,0.03)',
                border:`1px solid ${hov===core.id ? core.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius:16, padding:'16px 22px',
                cursor:'pointer', transition:'all 0.25s', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:18,
                boxShadow: hov===core.id ? `0 0 20px ${core.glowColor}` : 'none',
                transform: hov===core.id ? 'translateY(-2px) scale(1.01)' : 'none',
              }}
            >
              <span className="core-float" style={{ '--core-color': core.color, fontSize:36, lineHeight:1 }}>{core.icon}</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:15, fontWeight:800, color: hov===core.id ? core.color : '#f1f5f9', letterSpacing:1 }}>{core.label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{core.desc}</div>
              </div>
              {hov===core.id && <div style={{ marginLeft:'auto', color:core.color, fontSize:20 }}>➤</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Level1({ onWin, onLose, lives, setLives }) {
  const [questions]             = useState(() => shuffle([...ALL_Q1]).slice(0, 12));
  const [eHp, setEHp]           = useState(5);
  const [pHp, setPHp]           = useState(5);
  const [qIdx, setQIdx]         = useState(0);
  const [sel, setSel]           = useState(null);
  const [answered, setAnswered] = useState(false);
  const [castleShake, setCastleShake] = useState(''); // 'enemy' | 'player'
  const [bomb, setBomb]         = useState(null); // { fromLeft: bool }
  const [explosion, setExplosion] = useState(null); // 'right' | 'left'
  const [showCoreSelect, setShowCoreSelect] = useState(false);
  const [activeCore, setActiveCore] = useState(null); // current buffed core
  const [shieldActive, setShieldActive] = useState(false);
  const [powerBonus, setPowerBonus] = useState(false); // next correct hit = -2
  const [dmgFloat, setDmgFloat] = useState(null); // { text, side }
  const answeredRef = useRef(false);

  const q = questions[qIdx % questions.length];

  const triggerBomb = (fromLeft, targetSide, onHit) => {
    setBomb({ fromLeft });
    setTimeout(() => {
      setBomb(null);
      setExplosion(targetSide);
      onHit();
      setTimeout(() => setExplosion(null), 600);
    }, 800);
  };

  const confirm = () => {
    if (sel === null || answered || answeredRef.current) return;
    answeredRef.current = true;
    sfx.play('click');
    setAnswered(true);

    if (sel === q.ans) {
      sfx.play('correct');
      const dmg = powerBonus ? 2 : 1;
      setPowerBonus(false);
      triggerBomb(true, 'right', () => {
        setCastleShake('enemy');
        setTimeout(() => setCastleShake(''), 700);
        setDmgFloat({ text: `-${dmg} HP`, side: 'right' });
        setTimeout(() => setDmgFloat(null), 1200);
        setEHp(prev => {
          const next = Math.max(0, prev - dmg);
          if (next <= 0) setTimeout(() => onWin(500), 900);
          return next;
        });
      });
    } else {
      sfx.play('wrong');
      if (shieldActive) {
        setShieldActive(false);
        setDmgFloat({ text: '🛡️ CHẶN!', side: 'left' });
        setTimeout(() => setDmgFloat(null), 1200);
        triggerBomb(false, 'left', () => {
          setCastleShake('player'); setTimeout(() => setCastleShake(''), 700);
        });
      } else {
        triggerBomb(false, 'left', () => {
          setCastleShake('player');
          setTimeout(() => setCastleShake(''), 700);
          setDmgFloat({ text: '-1 HP', side: 'left' });
          setTimeout(() => setDmgFloat(null), 1200);
          setPHp(prev => Math.max(0, prev - 1));
        });
      }
    }
  };

  const next = () => {
    if (pHp <= 0) {
      setLives(prev => {
        const nxt = prev - 1;
        if (nxt <= 0) { onLose(); return 0; }
        setPHp(5); setSel(null); setAnswered(false); answeredRef.current = false;
        setQIdx(i => i + 1);
        return nxt;
      });
      return;
    }
    setSel(null); setAnswered(false); answeredRef.current = false;
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    // Every 3 questions → show core select
    if ((nextIdx) % 3 === 0 && nextIdx < questions.length) {
      setTimeout(() => setShowCoreSelect(true), 200);
    }
  };

  const handleCoreSelect = (core) => {
    sfx.play('correct');
    setActiveCore(core);
    setShowCoreSelect(false);
    if (core.id === 'heart')  setPHp(p => Math.min(5, p + 1));
    if (core.id === 'shield') setShieldActive(true);
    if (core.id === 'power')  setPowerBonus(true);
  };

  return (
    <div style={S.screen}>
      {showCoreSelect && <CoreSelectOverlay onSelect={handleCoreSelect} />}

      {/* Battle Arena */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 80px 1fr', gap:8, alignItems:'center',
        background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.06)',
        borderRadius:22, padding:'18px 20px', position:'relative', overflow:'visible'
      }}>
        {/* Bomb projectile */}
        <BombProjectile active={!!bomb} fromLeft={bomb?.fromLeft} onEnd={() => setBomb(null)} />

        {/* Floating dmg indicator */}
        {dmgFloat && (
          <div style={{
            position:'absolute',
            top:'10%',
            [dmgFloat.side==='right' ? 'right' : 'left']: '5%',
            zIndex:70, pointerEvents:'none',
            fontSize:18, fontWeight:900,
            color: dmgFloat.text.includes('CHẶN') ? '#3b82f6' : dmgFloat.side==='right' ? '#ef4444' : '#fbbf24',
            textShadow:'0 0 12px currentColor',
            animation:'fadeUp 0.5s ease forwards',
          }}>{dmgFloat.text}</div>
        )}

        {/* Player Castle (our side) */}
        <div style={{ position:'relative' }}>
          <ExplosionFX active={explosion==='left'} side="left" />
          <CastleVisual
            hp={pHp} maxHp={5} label="Thành Ta"
            side="left"
            isShaking={castleShake==='player'}
            isExploding={false}
          />
        </div>

        {/* VS + Status */}
        <div style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
          <div style={{ color:'rgba(255,255,255,0.15)', fontSize:22, fontWeight:900 }}>VS</div>
          {shieldActive && <div style={{ fontSize:18, filter:'drop-shadow(0 0 8px rgba(59,130,246,0.9))' }} title="Khiên đang hoạt động">🛡️</div>}
          {powerBonus && <div style={{ fontSize:18, filter:'drop-shadow(0 0 8px rgba(168,85,247,0.9))' }} title="Công gấp đôi lần tới">⚡</div>}
          {activeCore && !shieldActive && !powerBonus && <div style={{ fontSize:14, opacity:0.4 }}>{activeCore.icon}</div>}
        </div>

        {/* Enemy Castle */}
        <div style={{ position:'relative' }}>
          <ExplosionFX active={explosion==='right'} side="right" />
          <CastleVisual
            hp={eHp} maxHp={5} label="Thành Địch"
            side="right"
            isShaking={castleShake==='enemy'}
            isExploding={eHp<=0}
          />
        </div>
      </div>

      {/* Active core badge */}
      {activeCore && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(255,255,255,0.03)', border:`1px solid ${activeCore.color}44`,
          borderRadius:12, padding:'8px 16px', fontSize:12, color:'rgba(255,255,255,0.5)',
          alignSelf:'flex-start'
        }}>
          <span>{activeCore.icon}</span>
          <span style={{ color: activeCore.color, fontWeight:700 }}>{activeCore.label}</span>
          <span>đang kích hoạt</span>
          {shieldActive && <span style={{ color:'#3b82f6' }}>• Khiên chờ sẵn</span>}
          {powerBonus && <span style={{ color:'#a855f7' }}>• Công tiếp -2 HP</span>}
        </div>
      )}

      {/* ── Quote Banner ── */}
      <div style={{
        position:'relative',
        background:'linear-gradient(160deg, #e8d5aa 0%, #d9c08a 40%, #c9ac6e 100%)',
        borderRadius:18, padding:'1.4rem 2.4rem', textAlign:'center',
        boxShadow:'0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
        border:'1px solid rgba(160,120,50,0.6)', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:10, left:18, right:18, height:1, background:'rgba(100,65,20,0.25)' }} />
        <div style={{ position:'absolute', bottom:10, left:18, right:18, height:1, background:'rgba(100,65,20,0.25)' }} />
        <span style={{ position:'absolute', top:5, left:10,  fontSize:12, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', top:5, right:10, fontSize:12, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', bottom:5, left:10,  fontSize:12, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', bottom:5, right:10, fontSize:12, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <p style={{ margin:0, fontSize:14, fontWeight:700, lineHeight:1.8, color:'#2c1e10',
          fontFamily:"Georgia, 'Times New Roman', serif", textTransform:'uppercase', letterSpacing:2,
          textShadow:'0 1px 0 rgba(255,255,255,0.4)'
        }}>
          &ldquo;Đoàn kết, đoàn kết, đại đoàn kết.<br/>
          Thành công, thành công, đại thành công.&rdquo;
        </p>
        <div style={{ marginTop:8, fontSize:11, color:'#5a3a10', fontFamily:"Georgia, serif", fontStyle:'italic', opacity:0.75 }}>— Hồ Chí Minh</div>
      </div>

      {/* Question */}
      {(eHp > 0 || answered) && (pHp > 0 || answered) && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...S.cardDark, padding:'18px 24px', position:'relative' }}>
            <div style={{ position:'absolute', top:12, right:14, fontSize:10, color:S.gold, fontFamily:'monospace', letterSpacing:2, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', padding:'4px 12px', borderRadius:8 }}>
              CÂU {(qIdx % questions.length) + 1} / {questions.length}
            </div>
            {/* Core pick hint every 3 */}
            {((qIdx+1) % 3 === 0) && (qIdx+1) < questions.length && !answered && (
              <div style={{ position:'absolute', top:12, left:14, fontSize:10, color:'#a855f7', fontFamily:'monospace', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', padding:'4px 10px', borderRadius:8 }}>⚗️ Sau câu này: chọn lõi!</div>
            )}
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#ffffff', lineHeight:1.7, paddingRight:90, paddingTop: ((qIdx+1)%3===0 && (qIdx+1)<questions.length && !answered) ? 22 : 0 }}>
              {q.q}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {q.opts.map((opt, i) => {
              let bg = 'rgba(255,255,255,0.03)';
              let border = 'rgba(255,255,255,0.08)';
              let color = 'rgba(255,255,255,0.7)';
              if (sel === i && !answered) { bg='rgba(245,158,11,0.1)'; border=S.gold; color=S.gold; }
              if (answered) {
                if (i === q.ans)    { bg='rgba(16,185,129,0.12)'; border='#10b981'; color='#10b981'; }
                else if (sel === i) { bg='rgba(239,68,68,0.1)';  border='#ef4444'; color='#ef4444'; }
                else                { bg='transparent'; border='rgba(255,255,255,0.04)'; color='rgba(255,255,255,0.2)'; }
              }
              return (
                <button key={i} disabled={answered} onClick={() => { sfx.play('click'); setSel(i); }}
                  style={{
                    background:bg, border:`1px solid ${border}`, borderRadius:14,
                    padding:'14px 16px', textAlign:'left', fontSize:13, color, cursor: answered ? 'default' : 'pointer',
                    display:'flex', gap:12, alignItems:'flex-start', lineHeight:1.5,
                    transition:'all 0.2s', fontFamily:'inherit',
                  }}
                  onMouseEnter={e => { if (!answered && sel !== i) e.currentTarget.style.borderColor='rgba(245,158,11,0.4)'; }}
                  onMouseLeave={e => { if (!answered && sel !== i) e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                >
                  <span style={{
                    minWidth:24, height:24, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, border:`1px solid ${border}`,
                    background: sel===i && !answered ? S.gold : 'rgba(255,255,255,0.05)',
                    color: sel===i && !answered ? '#0a0a0a' : 'inherit', flexShrink:0
                  }}>{String.fromCharCode(65+i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {!answered ? (
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <GlowButton onClick={confirm} disabled={sel===null} color="#ef4444"
                style={{ opacity: sel===null ? 0.4 : 1, cursor: sel===null ? 'not-allowed' : 'pointer', fontSize:13, padding:'14px 34px' }}>
                💥 Công Phá Thành Lũy
              </GlowButton>
            </div>
          ) : (
            <div style={{
              ...S.cardDark, padding:'16px 20px',
              display:'flex', gap:14, alignItems:'flex-start',
              animation:'fadeUp 0.3s ease forwards'
            }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{sel===q.ans ? '🌱' : '💡'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color: sel===q.ans ? S.emerald : S.red, marginBottom:5, letterSpacing:1, textTransform:'uppercase' }}>
                  {sel===q.ans
                    ? (powerBonus ? '⚡ Sấm Sét! Công -2 HP địch!' : '💣 Ném bom thành công!')
                    : (shieldActive ? '🛡️ Khiên đã chặn đòn địch!' : '🔥 Địch phản kích!')
                  }
                </div>
                <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>{q.exp}</p>
              </div>
              <button onClick={next} style={{
                background:'linear-gradient(135deg, #10b981, #059669)', color:'#fff', border:'none',
                borderRadius:12, padding:'10px 20px', fontSize:11, fontWeight:700, cursor:'pointer',
                letterSpacing:2, whiteSpace:'nowrap', fontFamily:'inherit'
              }}>TIẾP TỤC ➔</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================================
// LEVEL 2 – DÒNG THỜI GIAN (v2 - Constellation Path)
// ===========================================================================================
const STAR_POSITIONS = [
  { top: '15%', left: '12%' },
  { top: '65%', left: '28%' },
  { top: '25%', left: '55%' },
  { top: '75%', left: '72%' },
  { top: '35%', left: '88%' }
];

function Level2({ onWin, onLose, lives, setLives }) {
  const [correctOrder]        = useState(() => pickTimeline());
  const [pool, setPool]       = useState(() => {
    const shuffled = shuffle([...correctOrder]);
    return shuffled.map((ev, i) => ({ ...ev, pos: STAR_POSITIONS[i] }));
  });
  const [ordered, setOrdered] = useState([]);
  const [wrong, setWrong]     = useState(false);

  const pick = (ev) => {
    if (wrong || ordered.find(o => o.id === ev.id)) return;
    sfx.play('click');
    const remaining = pool.filter(e => !ordered.find(o => o.id === e.id));
    const minYear = Math.min(...remaining.map(e => e.year));

    if (ev.year === minYear) {
      const next = [...ordered, ev];
      setOrdered(next);
      if (next.length === correctOrder.length) {
        sfx.play('correct');
        setTimeout(() => onWin(600), 1500); // Đợi laser bay xong
      }
    } else {
      sfx.play('wrong');
      setWrong(true);
      setLives(prev => {
        const nxt = prev - 1;
        if (nxt <= 0) { onLose(); return 0; }
        return nxt;
      });
      setTimeout(() => {
        const newSet = pickTimeline();
        const shuffled = shuffle([...newSet]);
        setPool(shuffled.map((e, i) => ({ ...e, pos: STAR_POSITIONS[i] })));
        setOrdered([]);
        setWrong(false);
      }, 1400);
    }
  };

  return (
    <div style={S.screen}>
      <div style={{ textAlign:'center', marginBottom:10 }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:S.gold, letterSpacing:3, textTransform:'uppercase' }}>
          ✨ Chòm Sao Lịch Sử
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Kết nối các mốc son từ cổ xưa đến hiện đại để thắp sáng con đường Cách mạng.
        </p>
      </div>

      <div className={wrong ? 'bg-flash-red' : ''} style={{
        ...S.cardDark, position:'relative', height: 420, overflow:'hidden',
        background:'radial-gradient(ellipse at center, rgba(15,20,35,0.8) 0%, rgba(5,10,15,0.95) 100%)',
        border:'1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Background stars */}
        <div style={{ position:'absolute', inset:0, background:'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'rgba(255,255,255,0.1)\'/%3E%3Ccircle cx=\'70\' cy=\'60\' r=\'1.5\' fill=\'rgba(255,255,255,0.15)\'/%3E%3C/svg%3E")', opacity:0.6 }} />

        {/* Laser Connections */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1 }}>
          {ordered.map((ev, i) => {
            if (i === 0) return null;
            const prev = ordered[i-1];
            return (
              <line key={ev.id}
                x1={prev.pos.left} y1={prev.pos.top}
                x2={ev.pos.left} y2={ev.pos.top}
                stroke={wrong ? '#ef4444' : '#10b981'} strokeWidth="2"
                strokeDasharray="100" className={wrong ? 'shake' : 'laser-line'}
                style={{ filter: wrong ? 'drop-shadow(0 0 6px #ef4444)' : 'drop-shadow(0 0 6px #10b981)' }}
              />
            );
          })}
        </svg>

        {/* Interactive Stars */}
        {pool.map((ev, i) => {
          const isSelected = ordered.find(o => o.id === ev.id);
          const isLast = ordered[ordered.length-1]?.id === ev.id;
          return (
            <div key={ev.id}
              onClick={() => pick(ev)}
              className={!isSelected ? 'star-twinkle' : ''}
              style={{
                position:'absolute', top: ev.pos.top, left: ev.pos.left,
                transform:'translate(-50%, -50%)', zIndex:10,
                display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                cursor: isSelected || wrong ? 'default' : 'pointer',
                opacity: (wrong && !isSelected) ? 0.3 : 1,
                transition:'all 0.3s'
              }}
            >
              {/* Star Core */}
              <div style={{
                width: isSelected ? 24 : 16, height: isSelected ? 24 : 16,
                background: isSelected ? S.emerald : 'rgba(255,255,255,0.8)',
                borderRadius:'50%',
                boxShadow: isSelected ? '0 0 20px #10b981, 0 0 40px #10b981' : '0 0 10px rgba(255,255,255,0.5)',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.3s',
                border: isSelected ? '2px solid #fff' : 'none'
              }}>
                {isSelected && <span style={{ fontSize:10, color:'#000', fontWeight:900 }}>✓</span>}
              </div>

              {/* Event Text Card */}
              <div style={{
                background: isSelected ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.6)',
                border: isSelected ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter:'blur(4px)', borderRadius:8,
                padding:'6px 10px', width:140, textAlign:'center',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                fontSize:11, lineHeight:1.4, pointerEvents:'none',
                transform: isLast ? 'scale(1.05)' : 'scale(1)', transition:'transform 0.2s',
                boxShadow: isSelected ? '0 4px 12px rgba(16,185,129,0.2)' : 'none'
              }}>
                {isSelected && <div style={{ color:S.emerald, fontWeight:900, fontSize:10, marginBottom:2 }}>{ev.year}</div>}
                {ev.text}
              </div>
            </div>
          );
        })}

        {/* Error Overlay */}
        {wrong && (
          <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.1)' }}>
            <div className="shake" style={{ background:'rgba(15,5,5,0.9)', border:'1px solid #ef4444', padding:'16px 32px', borderRadius:16, color:'#ef4444', fontWeight:800, fontSize:16, letterSpacing:2, textTransform:'uppercase', boxShadow:'0 0 30px rgba(239,68,68,0.5)' }}>
              ⚡ Gãy Liên Kết Thời Gian!
            </div>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8 }}>
        {correctOrder.map((_, i) => (
          <div key={i} style={{
            width:30, height:6, borderRadius:3,
            background: i < ordered.length ? S.emerald : 'rgba(255,255,255,0.1)',
            boxShadow: i < ordered.length ? '0 0 8px #10b981' : 'none',
            transition:'all 0.3s'
          }} />
        ))}
      </div>
    </div>
  );
}

// ===========================================================================================
// LEVEL 3 – LẮP GHÉP CHÂN LÝ (v2 - Energy Forge)
// ===========================================================================================
function Level3({ onWin, onLose, lives, setLives }) {
  const [puzzle]              = useState(() => ALL_PUZZLES[Math.floor(Math.random() * ALL_PUZZLES.length)]);
  const blankKeys = ['b0','b1','b2','b3'];
  const [answers, setAnswers] = useState({ b0:'', b1:'', b2:'', b3:'' });
  const [activeBl, setActiveBl] = useState(null);
  const [status, setStatus]   = useState('idle'); // 'idle' | 'checking' | 'wrong' | 'done'

  // Kích hoạt quét tự động khi điền đủ
  useEffect(() => {
    const isFull = blankKeys.every(k => answers[k] !== '');
    if (isFull && status === 'idle') {
      setStatus('checking');
      sfx.play('click');
      setTimeout(() => verify(), 800); // Giả lập tia sáng quét
    }
  }, [answers, status]);

  const verify = () => {
    const wrongKeys = blankKeys.filter(k => answers[k] !== puzzle.blanks[k]);
    if (wrongKeys.length === 0) {
      sfx.play('correct');
      setStatus('done');
      setTimeout(() => onWin(700), 1800);
    } else {
      sfx.play('wrong');
      setStatus('wrong');
      setLives(prev => {
        const nxt = prev - 1;
        if (nxt <= 0) { onLose(); return 0; }
        return nxt;
      });
      setTimeout(() => {
        // Nhả các từ sai ra
        setAnswers(a => {
          const next = { ...a };
          wrongKeys.forEach(k => next[k] = '');
          return next;
        });
        setStatus('idle');
      }, 1500);
    }
  };

  const pickBlank = (key) => {
    if (status !== 'idle') return;
    sfx.play('click'); setActiveBl(key);
  };

  const pickWord = (word) => {
    if (!activeBl || status !== 'idle') return;
    sfx.play('click');
    setAnswers(a => ({ ...a, [activeBl]: word }));
    setActiveBl(null);
  };

  const clearBlank = (key, e) => {
    e.stopPropagation();
    if (status !== 'idle') return;
    sfx.play('click');
    setAnswers(a => ({ ...a, [key]: '' }));
  };

  const usedWords = Object.values(answers).filter(Boolean);
  const bankWords = puzzle.wordBank.filter(w => !usedWords.includes(w));

  const renderText = () => {
    const parts = puzzle.template.split(/(\{b\d\})/);
    return parts.map((part, i) => {
      const m = part.match(/\{(b\d)\}/);
      if (m) {
        const key = m[1];
        const val = answers[key];
        const isActive = activeBl === key;
        const isWrong = status === 'wrong' && val !== puzzle.blanks[key];
        const isChecking = status === 'checking';
        const isDone = status === 'done';

        let bg = 'rgba(0,0,0,0.5)';
        let border = 'rgba(245,158,11,0.2)';
        let shadow = 'none';
        let color = 'rgba(245,158,11,0.4)';

        if (isActive) { bg = 'rgba(245,158,11,0.15)'; border = S.gold; shadow = '0 0 12px rgba(245,158,11,0.4)'; color = S.gold; }
        else if (val) {
          if (isDone) { bg = 'rgba(16,185,129,0.2)'; border = S.emerald; shadow = '0 0 15px rgba(16,185,129,0.5)'; color = S.emerald; }
          else if (isWrong) { bg = 'rgba(239,68,68,0.2)'; border = S.red; shadow = '0 0 15px rgba(239,68,68,0.5)'; color = S.red; }
          else if (isChecking) { bg = 'rgba(59,130,246,0.2)'; border = '#3b82f6'; shadow = '0 0 10px rgba(59,130,246,0.4)'; color = '#60a5fa'; }
          else { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.5)'; color = S.emerald; }
        }

        return (
          <span key={i}
            onClick={() => pickBlank(key)}
            className={`${val && !isChecking && !isWrong && !isDone ? 'slot-in' : ''} ${isWrong ? 'shake' : ''} ${isChecking ? 'pulse' : ''}`}
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:bg, border:`1px solid ${border}`, boxShadow:shadow, color,
              borderRadius:10, padding:'4px 12px', margin:'0 6px',
              fontSize:14, fontWeight:800, cursor: status==='idle' ? 'pointer' : 'default',
              transition:'all 0.3s', position:'relative', overflow:'hidden'
            }}
          >
            {isChecking && <div style={{ position:'absolute', top:0, left:'-100%', width:'50%', height:'100%', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation:'laserDraw 0.8s infinite linear' }} />}
            {val ? (
              <>
                <span style={{ position:'relative', zIndex:2 }}>{val}</span>
                {status === 'idle' && <span onClick={e => clearBlank(key,e)} style={{ color:S.red, fontSize:12, fontWeight:900, position:'relative', zIndex:2 }}>✕</span>}
              </>
            ) : (
              <span style={{ opacity:0.6, fontSize:12, fontStyle:'italic' }}>Trống</span>
            )}
          </span>
        );
      }
      return <span key={i} style={{ fontSize:15, lineHeight:2.2, color: status==='done' ? '#fcd34d' : 'inherit', transition:'color 0.5s' }}>{part}</span>;
    });
  };

  return (
    <div style={S.screen}>
      <div style={{ textAlign:'center' }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:S.emerald, letterSpacing:3, textTransform:'uppercase' }}>
          ⚗️ Lõi Năng Lượng Chân Lý
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Kích hoạt bia đá bằng cách lắp đúng mảnh chữ. Hệ thống sẽ tự động quét.
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {/* Bia Đá Trích Dẫn */}
        <div className={status === 'wrong' ? 'shake' : ''} style={{
          background:'linear-gradient(135deg, rgba(15,20,35,0.9), rgba(10,15,25,0.95))',
          border:`1px solid ${status==='done' ? S.gold : status==='wrong' ? S.red : status==='checking' ? '#3b82f6' : 'rgba(59,130,246,0.3)'}`,
          borderRadius:24, padding:'28px 32px', position:'relative', overflow:'hidden',
          boxShadow: status==='done' ? '0 0 40px rgba(245,158,11,0.2)' : status==='wrong' ? '0 0 40px rgba(239,68,68,0.2)' : '0 10px 30px rgba(0,0,0,0.5)',
          transition:'all 0.5s'
        }}>
          {status === 'checking' && <div style={{ position:'absolute', top:0, bottom:0, width:4, background:'#60a5fa', boxShadow:'0 0 20px #3b82f6', animation:'laserDraw 0.8s linear forwards' }} />}
          
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:12, marginBottom:16 }}>
            <div style={{ fontSize:11, color:'rgba(59,130,246,0.8)', fontFamily:'monospace', letterSpacing:2, fontWeight:700 }}>
              <span className="pulse" style={{ marginRight:6 }}>●</span> HỆ THỐNG VĂN KIỆN: {puzzle.src}
            </div>
            {status === 'checking' && <div style={{ fontSize:10, color:'#60a5fa', fontFamily:'monospace', animation:'pulsate 0.5s infinite' }}>ĐANG QUÉT...</div>}
            {status === 'wrong' && <div style={{ fontSize:10, color:S.red, fontFamily:'monospace', fontWeight:900 }}>CẢNH BÁO: SAI LỆCH NĂNG LƯỢNG</div>}
            {status === 'done' && <div style={{ fontSize:10, color:S.gold, fontFamily:'monospace', fontWeight:900 }}>MỞ KHÓA THÀNH CÔNG</div>}
          </div>
          
          <div style={{ color:'rgba(241,245,249,0.9)', fontFamily:"Aptos, 'Inter', sans-serif", fontStyle:'italic', lineHeight:2.2, fontSize:16 }}>
            {renderText()}
          </div>
        </div>

        {/* Word Bank Floating */}
        <div style={{
          ...S.cardDark, padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:16,
          background:'rgba(0,0,0,0.4)', opacity: status !== 'idle' ? 0.5 : 1, transition:'opacity 0.3s'
        }}>
          <div style={{ fontSize:10, fontFamily:'monospace', letterSpacing:3, color:'rgba(255,255,255,0.3)' }}>
            🔋 KHO MẢNH GHÉP
          </div>
          
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
            {bankWords.map((w,i) => (
              <button key={i} onClick={() => pickWord(w)} disabled={!activeBl || status !== 'idle'}
                className="float"
                style={{
                  background: activeBl ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)',
                  border:`1px solid ${activeBl ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:12, padding:'10px 18px', fontSize:13, fontFamily:'monospace', fontWeight:600,
                  color: activeBl ? '#60a5fa' : 'rgba(255,255,255,0.6)', cursor: activeBl ? 'pointer' : 'not-allowed',
                  transition:'all 0.2s', boxShadow: activeBl ? '0 0 10px rgba(59,130,246,0.3)' : 'none',
                  animationDelay:`${i*0.1}s`
                }}
                onMouseEnter={e => { if(activeBl && status==='idle') { e.currentTarget.style.background='rgba(59,130,246,0.2)'; e.currentTarget.style.transform='scale(1.05)'; }}}
                onMouseLeave={e => { e.currentTarget.style.background= activeBl ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform='scale(1)'; }}
              >
                {w}
              </button>
            ))}
          </div>
          
          {!activeBl && bankWords.length > 0 && status === 'idle' && (
            <div className="pulse" style={{ fontSize:11, color:'rgba(245,158,11,0.7)', fontFamily:'monospace', background:'rgba(245,158,11,0.1)', padding:'4px 12px', borderRadius:8 }}>
              Chọn Lõi trống trên bia đá trước khi nạp mảnh ghép
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================================
// LEVEL 4 – BOSS FIGHT (v3 - Summon Dice)
// ===========================================================================================
function Level4({ onWin, onLose, lives, setLives }) {
  const [questions]           = useState(() => shuffle([...ALL_BOSS_Q]));
  const MAX_BOSS_HP = 15;
  const MAX_PLAYER_HP = 5;
  const [bHp, setBHp]         = useState(MAX_BOSS_HP);
  const [pHp, setPHp]         = useState(3);
  const [qIdx, setQIdx]       = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect]  = useState(false);
  const [timeLeft, setTime]    = useState(5);
  const [shake, setShake]      = useState('');
  
  // Hiệu ứng chiến đấu
  const [proj, setProj]        = useState({ active: false, type: '' });
  const [fText, setFText]      = useState({ active: false, text: '', target: '' });
  const isEnraged = bHp <= Math.ceil(MAX_BOSS_HP / 2);
  
  // Cơ chế Combo & Xúc xắc
  const [combo, setCombo]      = useState(0);
  const [shield, setShield]    = useState(false);
  const [dice, setDice]        = useState({ active: false, result: null });
  const [summon, setSummon]    = useState(0); // 1-6

  const timerRef = useRef(null);
  const q = questions[qIdx % questions.length];

  useEffect(() => {
    if (answered || dice.active || summon > 0) return;
    setTime(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleWrong(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, answered, dice.active, summon]);

  const triggerCombat = (isCorrect, callback) => {
    if (isCorrect) {
      setProj({ active: true, type: 'slash' });
      setTimeout(() => {
        sfx.play('correct'); setShake('boss');
        setFText({ active: true, text: '-1 HP', target: 'boss' });
        callback();
        setTimeout(() => { setProj({ active:false, type:'' }); setFText({ active:false, text:'', target:'' }); }, 1000);
      }, 300);
    } else {
      setProj({ active: true, type: 'orb' });
      setTimeout(() => {
        sfx.play('wrong'); setShake('player');
        setFText({ active: true, text: '-1 HP!', target: 'player' });
        callback();
        setTimeout(() => { setProj({ active:false, type:'' }); setFText({ active:false, text:'', target:'' }); }, 1000);
      }, 300);
    }
  };

  const checkWinLose = (newBHp, newPHp, newLives) => {
    if (newBHp <= 0) setTimeout(() => onWin(1500), 1200);
    if (newLives <= 0) setTimeout(() => onLose(), 500);
  };

  const triggerSkill = (skillId) => {
    setSummon(skillId);
    let dmg = 0; let heal = 0; let applyShield = false;
    if(skillId === 1) dmg = 3;
    else if(skillId === 2) dmg = 2;
    else if(skillId === 3) dmg = 4;
    else if(skillId === 4) dmg = 5;
    else if(skillId === 5) { heal = 1; applyShield = true; }
    else if(skillId === 6) dmg = 3;

    setTimeout(() => {
      sfx.play('correct');
      
      let nextB = bHp; let nextP = pHp; let nextL = lives;
      if (dmg > 0) {
        nextB = Math.max(0, bHp - dmg);
        setBHp(nextB);
        setFText({ active:true, text:`-${dmg} HP (KỸ NĂNG)`, target:'boss' });
        setShake('boss');
      }
      if (heal > 0) {
        nextP = Math.min(MAX_PLAYER_HP, pHp + heal);
        setPHp(nextP);
        if (applyShield) setShield(true);
        setFText({ active:true, text:`+${heal} HP & KHIÊN`, target:'player' });
      }
      setTimeout(() => { 
        setSummon(0); 
        setFText({active:false, text:'', target:''}); 
        checkWinLose(nextB, nextP, nextL); 
      }, 2000);
    }, 800); // Wait for summon animation to hit
  };

  const handleCorrect = () => {
    setAnswered(true); setCorrect(true);
    const nextCombo = combo + 1;
    
    if (nextCombo >= 3) {
      setCombo(0);
      setDice({ active: true, result: null });
      sfx.play('click');
      // Roll dice animation
      setTimeout(() => {
        const res = Math.floor(Math.random() * 6) + 1;
        setDice({ active: true, result: res });
        sfx.play('correct');
        setTimeout(() => {
           setDice({ active: false, result: null });
           triggerSkill(res);
        }, 1500);
      }, 1500);
    } else {
      setCombo(nextCombo);
      triggerCombat(true, () => {
         const nextB = Math.max(0, bHp - 1);
         setBHp(nextB);
         checkWinLose(nextB, pHp, lives);
      });
    }
  };

  const handleWrong = (isTimeout = false) => {
    setAnswered(true); setCorrect(false);
    setCombo(0);
    if (shield) {
       setShield(false);
       sfx.play('correct'); // block sound
       setFText({ active:true, text:'KHIÊN CHẶN ĐÒN!', target:'player' });
       setTimeout(() => { setFText({active:false, text:'', target:''}); }, 1200);
    } else {
       triggerCombat(false, () => {
         const nextP = Math.max(0, pHp - 1);
         const nextL = lives - 1;
         setPHp(nextP);
         setLives(prev => Math.max(0, prev - 1));
         checkWinLose(bHp, nextP, nextL);
       });
    }
  };

  const answer = (choice) => {
    if (answered || dice.active || summon > 0) return;
    clearInterval(timerRef.current);
    sfx.play('click');
    if (choice === q.isTrue) handleCorrect();
    else handleWrong();
  };

  const next = () => {
    if (pHp <= 0 && lives > 0) setPHp(3);
    setAnswered(false);
    setQIdx(i => i+1);
  };

  const renderSummonVFX = () => {
    if (!summon) return null;
    return (
      <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', overflow:'hidden', borderRadius:20 }}>
        {summon === 1 && (
          <>
            <div className="meteor-1" style={{ position:'absolute', fontSize:40 }}>🌠</div>
            <div className="meteor-2" style={{ position:'absolute', fontSize:30, top:20, left:20 }}>🌠</div>
            <div className="meteor-3" style={{ position:'absolute', fontSize:35, top:-20, left:40 }}>🌠</div>
          </>
        )}
        {summon === 2 && (
          <div style={{ position:'absolute', inset:0, display:'flex', justifyContent:'space-around' }}>
            <div className="fire-drop" style={{ fontSize:30 }}>🔥</div>
            <div className="fire-drop" style={{ fontSize:20, animationDelay:'0.2s' }}>🔥</div>
            <div className="fire-drop" style={{ fontSize:40, animationDelay:'0.1s' }}>🔥</div>
            <div className="fire-drop" style={{ fontSize:25, animationDelay:'0.3s' }}>🔥</div>
          </div>
        )}
        {summon === 3 && (
          <div className="meteorite-drop" style={{ position:'absolute', left:'70%', fontSize:80, filter:'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}>🪨</div>
        )}
        {summon === 4 && (
          <div className="dragon-fly" style={{ position:'absolute', top:'20%', fontSize:80, filter:'drop-shadow(0 0 20px #ef4444)' }}>🐉</div>
        )}
        {summon === 5 && (
          <div style={{ position:'absolute', left:'10%', bottom:'20%', width:100, height:100, background:'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', animation:'glowBoss 1s forwards' }} />
        )}
        {summon === 6 && (
          <div style={{ position:'absolute', left:'70%', top:0, width:10, height:120, background:'#fcd34d', boxShadow:'0 0 20px #fcd34d', className:'lightning-strike' }} />
        )}
      </div>
    );
  };

  return (
    <div style={{...S.screen, transition:'background 1s', background: isEnraged ? 'radial-gradient(ellipse at center, rgba(80,10,10,0.9) 0%, rgba(10,5,5,1) 100%)' : S.screen.background}}>
      
      {/* Cảnh báo Enrage */}
      {isEnraged && (
        <>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:8, background:'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 20px, #000 20px, #000 40px)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:8, background:'repeating-linear-gradient(45deg, #000, #000 20px, #f59e0b 20px, #f59e0b 40px)' }} />
        </>
      )}

      <div style={{ textAlign:'center' }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color: isEnraged ? '#ef4444' : S.red, letterSpacing:3, textTransform:'uppercase' }}>
          👹 {isEnraged ? 'BOSS CUỒNG NỘ' : 'Trận Chiến Cuối – Boss Fight'}
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Cứ 3 Combo đúng liên tiếp sẽ triệu hồi xúc xắc ma thuật!
        </p>
      </div>

      {/* Battle field */}
      <div className={(isEnraged && !answered && !dice.active) ? 'pulse' : ''} style={{
        display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:16, alignItems:'center', position:'relative',
        background: isEnraged ? 'rgba(30,0,0,0.6)' : 'rgba(0,0,0,0.5)', border: isEnraged ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius:20, padding:'20px 24px', boxShadow: isEnraged ? '0 0 40px rgba(239,68,68,0.1)' : 'none'
      }}>
        {renderSummonVFX()}
        
        {/* Khu vực Người chơi */}
        <div style={{ position:'relative' }}>
          <CombatantCard emoji="🧑‍✈️" label="Bản Lĩnh Ta" hp={pHp} maxHp={MAX_PLAYER_HP} color="#10b981" shade="rgba(16,185,129,0.15)" shake={shake==='player'} />
          {shield && <div style={{ position:'absolute', top:-5, right:-5, fontSize:20, animation:'pulsate 1.5s infinite' }}>🛡️</div>}
          {fText.active && fText.target === 'player' && (
            <div style={{ position:'absolute', top:'-20px', left:'50%', transform:'translateX(-50%)', color:S.red, fontWeight:900, fontSize:16, textShadow:'0 0 10px #000', animation:'floatTextUp 1s forwards', whiteSpace:'nowrap', pointerEvents:'none', zIndex:30 }}>
              {fText.text}
            </div>
          )}
        </div>

        {/* Projectile & Dice Area */}
        <div style={{ position:'relative', height:60, display:'flex', justifyContent:'center', alignItems:'center' }}>
          {!dice.active && <div style={{ textAlign:'center', color: isEnraged ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)', fontSize:26, fontWeight:900 }}>VS</div>}
          
          {/* Combo Indicator */}
          {!dice.active && combo > 0 && (
            <div style={{ position:'absolute', bottom:-20, fontSize:10, color:S.gold, fontWeight:800, whiteSpace:'nowrap', background:'rgba(245,158,11,0.2)', padding:'2px 8px', borderRadius:8 }}>
              Combo: {combo}/3
            </div>
          )}

          {proj.active && proj.type === 'slash' && (
            <div style={{ position:'absolute', fontSize:32, color:S.emerald, textShadow:'0 0 20px #10b981', animation:'slashFly 0.3s forwards', zIndex:10 }}>⚡</div>
          )}
          {proj.active && proj.type === 'orb' && (
            <div style={{ position:'absolute', fontSize:32, filter:'hue-rotate(250deg)', animation:'orbFly 0.3s forwards', zIndex:10 }}>🔮</div>
          )}
          
          {/* Dice Overlay */}
          {dice.active && (
            <div style={{ position:'absolute', zIndex:50, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div className={dice.result ? "pulse" : "dice-rolling"} style={{
                width:50, height:50, background:'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius:10, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, fontWeight:900, color:'#000', boxShadow:'0 0 20px rgba(245,158,11,0.5)'
              }}>
                {dice.result ? dice.result : '?'}
              </div>
            </div>
          )}
        </div>

        {/* Khu vực Boss */}
        <div style={{ position:'relative' }}>
          <CombatantCard emoji="👹" label="Boss Luận Điệu" hp={bHp} maxHp={MAX_BOSS_HP} color="#ef4444" shade="rgba(239,68,68,0.15)" shake={shake==='boss'} reverse bossMode={!isEnraged} />
          {isEnraged && <div style={{ position:'absolute', inset:-10, borderRadius:'50%', background:'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)', animation:'glowBoss 0.5s infinite', zIndex:-1, pointerEvents:'none' }} />}
          {fText.active && fText.target === 'boss' && (
            <div style={{ position:'absolute', top:'-20px', left:'50%', transform:'translateX(-50%)', color:S.gold, fontWeight:900, fontSize:16, textShadow:'0 0 10px #000', animation:'floatTextUp 1s forwards', whiteSpace:'nowrap', pointerEvents:'none', zIndex:30 }}>
              {fText.text}
            </div>
          )}
        </div>
      </div>

      {/* Timer bar */}
      {!answered && !dice.active && !summon && (
        <div className={timeLeft <= 2 ? 'pulse-fast' : ''} style={{ background:'rgba(0,0,0,0.5)', borderRadius:999, height:8, overflow:'hidden', border: timeLeft <= 2 ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            height:'100%', borderRadius:999,
            background: timeLeft <= 2 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            width:`${(timeLeft/5)*100}%`, transition:'width 1s linear',
            boxShadow: timeLeft <= 2 ? '0 0 15px rgba(239,68,68,0.8)' : '0 0 10px rgba(245,158,11,0.4)'
          }} />
        </div>
      )}

      {/* Statement card */}
      {bHp > 0 && pHp > 0 && !dice.active && !summon && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{
            ...S.cardDark, padding:'22px 28px', textAlign:'center', position:'relative',
            border: isEnraged ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)'
          }}>
            <div className={timeLeft <= 2 && !answered ? "pulse-fast" : "pulse"} style={{ fontSize:10, color:S.red, fontFamily:'monospace', letterSpacing:2, marginBottom:12 }}>
              ⚡ NHẬN ĐỊNH CỦA BOSS · {!answered && `${timeLeft} GIÂY`}
            </div>
            <p style={{ margin:0, fontSize:16, fontWeight:600, color:'#f1f5f9', lineHeight:1.7, fontFamily:"Aptos, 'Inter', sans-serif", fontStyle:'italic' }}>
              "{q.stmt}"
            </p>
          </div>

          {!answered ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <GlowButton onClick={() => answer(true)}  color="#10b981" style={{ fontSize:13, padding:'16px 0' }}>
                👍 Đồng Tình (Đúng)
              </GlowButton>
              <GlowButton onClick={() => answer(false)} color="#ef4444" style={{ fontSize:13, padding:'16px 0' }}>
                👎 Phản Bác (Sai)
              </GlowButton>
            </div>
          ) : (
            <div style={{ ...S.cardDark, padding:'18px 22px', animation:'fadeUp 0.3s ease' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22, color: correct ? S.emerald : S.red }}>{correct ? '✓' : '✗'}</span>
                <span style={{ fontSize:12, fontWeight:800, color: correct ? S.emerald : S.red, textTransform:'uppercase', letterSpacing:2 }}>
                  {correct ? 'Phản xạ chính xác!' : 'Phản xạ thất bại!'}
                </span>
              </div>
              <p style={{ margin:'0 0 14px', fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>{q.exp}</p>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={next} style={{
                  background:'linear-gradient(135deg, #f59e0b, #d97706)', color:'#0a0a0a',
                  border:'none', borderRadius:12, padding:'10px 24px', fontSize:11,
                  fontWeight:800, cursor:'pointer', letterSpacing:2, fontFamily:'inherit'
                }}>TIẾP TỤC ➔</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================================
// VICTORY SCREEN
// ===========================================================================================
function VictoryScreen({ score, onRestart }) {
  return (
    <div style={{ ...S.screen, alignItems:'center', textAlign:'center', padding:'16px 0' }}>
      <div className="float" style={{ fontSize:72 }}>🏆</div>
      <h2 style={{
        margin:0, fontSize:30, fontWeight:900,
        background:'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        fontFamily:"'Cinzel', serif", textTransform:'uppercase', letterSpacing:4
      }}>
        Chiến Thắng Hoàng Kim!
      </h2>
      <p style={{ margin:0, maxWidth:440, fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.8 }}>
        Xuất sắc! Bạn đã vượt qua toàn bộ 4 cửa ải học thuật HCM202 và đánh bại mọi luận điệu sai trái.
      </p>

      <div style={{
        background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.25)',
        borderRadius:20, padding:'20px 50px', position:'relative'
      }}>
        <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }} />
        <div style={{ fontSize:10, color:'rgba(245,158,11,0.5)', letterSpacing:4, fontFamily:'monospace', marginBottom:8 }}>TỔNG ĐIỂM TÍCH LŨY</div>
        <div style={{ fontSize:52, fontWeight:900, fontFamily:'monospace', color:S.gold, textShadow:'0 0 20px rgba(245,158,11,0.4)' }}>{score}</div>
      </div>

      <GlowButton onClick={onRestart} color="#f59e0b" style={{ fontSize:12, padding:'14px 40px' }}>
        🔁 Chinh Phục Lại
      </GlowButton>
    </div>
  );
}

// ===========================================================================================
// GAME OVER SCREEN
// ===========================================================================================
function GameOverScreen({ score, onRestart }) {
  return (
    <div style={{ ...S.screen, alignItems:'center', textAlign:'center', padding:'16px 0' }}>
      <div style={{ fontSize:64, filter:'grayscale(0.3)' }}>💔</div>
      <h2 style={{ margin:0, fontSize:28, fontWeight:900, color:S.red, fontFamily:"'Cinzel', serif", textTransform:'uppercase', letterSpacing:3 }}>
        Hành Trình Bị Gián Đoạn
      </h2>
      <p style={{ margin:0, maxWidth:420, fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.8 }}>
        Sinh mệnh cạn kiệt. Đừng nản chí! Đây là cơ hội để ôn lại giáo trình HCM202 và củng cố tư tưởng.
      </p>

      <div style={{
        background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
        borderRadius:20, padding:'18px 50px', position:'relative'
      }}>
        <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }} />
        <div style={{ fontSize:10, color:'rgba(239,68,68,0.5)', letterSpacing:4, fontFamily:'monospace', marginBottom:8 }}>ĐIỂM ĐẠT ĐƯỢC</div>
        <div style={{ fontSize:44, fontWeight:900, fontFamily:'monospace', color:'rgba(239,68,68,0.7)' }}>{score}</div>
      </div>

      <GlowButton onClick={onRestart} color="#ef4444" style={{ fontSize:12, padding:'14px 40px' }}>
        ⚔️ Phục Thù Trận Đấu
      </GlowButton>
    </div>
  );
}

// ===========================================================================================
// REUSABLE – COMBATANT CARD
// ===========================================================================================
function CombatantCard({ emoji, label, hp, maxHp, color, shade, shake, reverse, bossMode }) {
  return (
    <div className={shake ? 'shake' : ''} style={{
      display:'flex', flexDirection: reverse ? 'column' : 'column',
      alignItems: reverse ? 'flex-end' : 'flex-start', gap:10,
      background: shake ? shade : 'transparent',
      borderRadius:16, padding:'10px 14px', transition:'background 0.3s'
    }}>
      <div style={{ display:'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems:'center', gap:12, width:'100%' }}>
        <span className={bossMode ? 'boss-glow' : ''} style={{ fontSize:52 }}>{emoji}</span>
        <div style={{ flex:1, textAlign: reverse ? 'right' : 'left' }}>
          <div style={{ fontSize:12, fontFamily:'monospace', letterSpacing:2, color:'rgba(255,255,255,0.45)', marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>{label}</div>
          <div style={{ fontSize:13, fontFamily:'monospace', color, marginBottom:8, fontWeight:700 }}>HP: {hp} / {maxHp}</div>
          <div style={{ background:'rgba(0,0,0,0.5)', borderRadius:999, height:12, overflow:'hidden', border:`1px solid ${color}22` }}>
            <div style={{
              height:'100%', borderRadius:999,
              background:`linear-gradient(90deg, ${color}aa, ${color})`,
              width:`${(hp/maxHp)*100}%`, transition:'width 0.5s cubic-bezier(.4,0,.2,1)',
              boxShadow:`0 0 10px ${color}77`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================================
// REUSABLE – GLOW BUTTON
// ===========================================================================================
function GlowButton({ onClick, children, color = '#f59e0b', style = {}, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled
          ? `linear-gradient(135deg, ${color}dd, ${color})`
          : `linear-gradient(135deg, ${color}bb, ${color}aa)`,
        border:'none', borderRadius:14, padding:'12px 28px',
        fontSize:12, fontWeight:800, color: color === '#f59e0b' || color === '#10b981' ? '#0a0a0a' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing:2, textTransform:'uppercase',
        boxShadow: hov && !disabled ? `0 6px 24px ${color}44` : `0 3px 12px ${color}22`,
        transform: hov && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        transition:'all 0.2s', fontFamily:'inherit',
        ...style
      }}
    >
      {children}
    </button>
  );
}

