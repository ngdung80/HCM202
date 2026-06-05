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
// DATABASE – CÂU HỎI & DỮ LIỆU TỪ GIÁO TRÌNH HCM202
// ===========================================================================================
// ── MÀN 1: 20 câu hỏi trắc nghiệm ──────────────────────────────────────────
const ALL_Q1 = [
  {
    q: "Đối tượng nghiên cứu của môn học Tư tưởng Hồ Chí Minh là gì?",
    opts: ["Hệ thống quan điểm, lý luận về cách mạng Việt Nam qua thực tiễn","Tiểu sử và lịch sử biên niên của gia đình Hồ Chí Minh","Quá trình xây dựng kinh tế thị trường định hướng XHCN","Các học thuyết triết học phương Tây thời Phục Hưng"],
    ans: 0, exp: "Đối tượng là toàn bộ hệ thống quan điểm lý luận về cách mạng Việt Nam, được hình thành và kiểm nghiệm qua thực tiễn hoạt động của Người."
  },
  {
    q: "Tại Đại hội Đảng nào, Tư tưởng Hồ Chí Minh chính thức được ghi là nền tảng tư tưởng của Đảng?",
    opts: ["Đại hội VI (1986)","Đại hội VII (1991)","Đại hội IX (2001)","Đại hội XI (2011)"],
    ans: 1, exp: "Đại hội VII (1991) ghi vào Cương lĩnh và Điều lệ Đảng vai trò nền tảng của Chủ nghĩa Mác-Lênin và Tư tưởng Hồ Chí Minh."
  },
  {
    q: "Nguồn gốc lý luận quyết định bước chuyển về chất trong tư tưởng cứu nước của Hồ Chí Minh?",
    opts: ["Chủ nghĩa Mác - Lênin","Nho giáo và Phật giáo Á Đông","Phong trào dân chủ tư sản Việt Nam","Các giá trị Cách mạng Mỹ và Pháp"],
    ans: 0, exp: "Chủ nghĩa Mác-Lênin chính là nguồn gốc trực tiếp và quyết định, đưa Bác từ chủ nghĩa yêu nước tiến lên lập trường cộng sản vô sản."
  },
  {
    q: "Độc lập dân tộc phải gắn liền với điều gì để đảm bảo tự do, ấm no thực sự cho nhân dân?",
    opts: ["Chủ nghĩa xã hội","Kinh tế tư nhân tự do","Liên minh với các đế quốc lớn","Chế độ phong kiến tiến bộ"],
    ans: 0, exp: "Độc lập dân tộc gắn liền với chủ nghĩa xã hội là sợi chỉ đỏ xuyên suốt toàn bộ tư tưởng Hồ Chí Minh."
  },
  {
    q: "Đảng Cộng sản Việt Nam theo Hồ Chí Minh đại diện cho lợi ích của ai?",
    opts: ["Giai cấp công nhân, nhân dân lao động và toàn dân tộc","Chỉ liên minh công nhân - nông dân","Phú nông, tư sản và địa chủ yêu nước","Trí thức và lực lượng quân sự cách mạng"],
    ans: 0, exp: "Đảng đại diện trung thành cho giai cấp công nhân, nhân dân lao động và toàn thể dân tộc Việt Nam."
  },
  {
    q: "Hồ Chí Minh ra đi tìm đường cứu nước vào năm nào và từ đâu?",
    opts: ["Năm 1911 từ Bến Nhà Rồng, Sài Gòn","Năm 1908 từ Huế, Trung Kỳ","Năm 1919 từ Paris, Pháp","Năm 1924 từ Quảng Châu, Trung Quốc"],
    ans: 0, exp: "Ngày 5/6/1911, Nguyễn Tất Thành rời bến cảng Nhà Rồng (Sài Gòn) trên con tàu Amiral Latouche-Tréville để bắt đầu hành trình tìm đường cứu nước."
  },
  {
    q: "Sự kiện nào chứng tỏ Nguyễn Ái Quốc đã tìm thấy con đường cứu nước đúng đắn vào năm 1920?",
    opts: ["Đọc bản Sơ thảo Luận cương của Lênin về vấn đề dân tộc và thuộc địa","Gặp Chủ tịch Hồ Chí Minh tại Moskva","Tham gia Cách mạng Tháng Mười Nga","Thành lập Hội Việt Nam Cách mạng Thanh niên"],
    ans: 0, exp: "Đọc 'Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa' của Lênin là bước ngoặt quyết định chuyển Nguyễn Ái Quốc sang lập trường cộng sản."
  },
  {
    q: "Tổ chức tiền thân nào do Nguyễn Ái Quốc thành lập năm 1925 tại Quảng Châu, đào tạo cán bộ cách mạng?",
    opts: ["Hội Việt Nam Cách mạng Thanh niên","Tân Việt Cách mạng Đảng","Việt Nam Quốc dân Đảng","Đảng Cộng sản Đông Dương"],
    ans: 0, exp: "Hội Việt Nam Cách mạng Thanh niên (1925) là tổ chức tiền thân trực tiếp, nơi đào tạo hàng trăm cán bộ cách mạng nòng cốt cho Đảng sau này."
  },
  {
    q: "Theo Hồ Chí Minh, muốn cứu nước và giải phóng dân tộc, không có con đường nào khác ngoài con đường nào?",
    opts: ["Con đường cách mạng vô sản","Con đường cải lương tư sản","Con đường dựa vào đế quốc Mỹ","Con đường phong kiến tiến bộ"],
    ans: 0, exp: "Người khẳng định: 'Muốn cứu nước và giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản.'"
  },
  {
    q: "Hồ Chí Minh viết 'Đường Kách Mệnh' vào năm nào và nhằm mục đích gì?",
    opts: ["1927 – tác phẩm lý luận cách mạng đầu tiên, chuẩn bị tư tưởng cho Đảng","1930 – tuyên ngôn thành lập Đảng Cộng sản Việt Nam","1945 – cương lĩnh xây dựng nhà nước DCCH","1951 – định hướng chiến lược kháng chiến"],
    ans: 0, exp: "'Đường Kách Mệnh' (1927) là tác phẩm lý luận đầu tiên hệ thống hóa quan điểm cách mạng, đặt nền tảng tư tưởng và tổ chức cho sự ra đời của Đảng."
  },
  {
    q: "Theo Hồ Chí Minh, đặc trưng bản chất nhất của chủ nghĩa xã hội ở Việt Nam là gì?",
    opts: ["Do nhân dân lao động làm chủ, nhà nước là của dân, do dân, vì dân","Quốc hữu hóa toàn bộ tư liệu sản xuất, xóa bỏ hoàn toàn tư hữu","Xây dựng kinh tế kế hoạch hóa tập trung theo mô hình Liên Xô","Tập thể hóa nông nghiệp triệt để theo gương Cách mạng Văn hóa Trung Quốc"],
    ans: 0, exp: "Chủ nghĩa xã hội theo Hồ Chí Minh là chế độ do nhân dân làm chủ, nhà nước của dân, do dân, vì dân, kinh tế phát triển cao, văn hóa tiên tiến."
  },
  {
    q: "Trong tư tưởng Hồ Chí Minh, 'văn hóa soi đường quốc dân đi' có nghĩa là gì?",
    opts: ["Văn hóa giữ vai trò định hướng, dẫn dắt sự nghiệp cách mạng và phát triển đất nước","Văn hóa chỉ là sản phẩm phụ của nền kinh tế, không có vai trò độc lập","Văn hóa phải phục tùng hoàn toàn đường lối chính trị của nhà nước","Chỉ có văn hóa phương Tây mới đủ sức dẫn đường cho dân tộc"],
    ans: 0, exp: "Người đặt văn hóa ngang tầm với chính trị, kinh tế, quân sự: văn hóa có sức mạnh định hướng, soi sáng con đường đi của cả dân tộc."
  },
  {
    q: "Quan điểm của Hồ Chí Minh về mối quan hệ giữa đức và tài trong người cán bộ, đảng viên?",
    opts: ["Đức là gốc, tài là quan trọng; cán bộ phải có đức, có tài, nhưng đức là nền tảng","Tài quan trọng hơn đức vì tài quyết định năng lực thực thi nhiệm vụ","Đức và tài bình đẳng nhau tuyệt đối, không thể thiếu yếu tố nào","Chỉ cần đức, tài là thứ yếu vì học tập có thể bù đắp sau"],
    ans: 0, exp: "Người khẳng định: 'Có tài mà không có đức là người vô dụng, có đức mà không có tài thì làm việc gì cũng khó.' Nhưng đức là gốc."
  },
  {
    q: "Nguyên tắc nào được Hồ Chí Minh coi là nguyên tắc tối cao trong quan hệ quốc tế?",
    opts: ["Tôn trọng độc lập, chủ quyền và toàn vẹn lãnh thổ của nhau","Lợi ích dân tộc phải phục tùng lợi ích giai cấp quốc tế","Ưu tiên liên minh với các nước lớn và cường quốc","Không tham gia bất kỳ liên minh quân sự nào"],
    ans: 0, exp: "Hồ Chí Minh luôn coi tôn trọng độc lập, chủ quyền quốc gia, bình đẳng và không can thiệp nội bộ là nguyên tắc tối cao trong bang giao quốc tế."
  },
  {
    q: "Theo Hồ Chí Minh, cách mạng giải phóng dân tộc ở thuộc địa có thể nổ ra trước và giành thắng lợi trước cách mạng vô sản ở chính quốc không?",
    opts: ["Có thể và cần thiết, không nên thụ động chờ đợi","Không thể, phải chờ đến khi cách mạng vô sản chính quốc thắng lợi","Phải xảy ra đồng thời với cách mạng chính quốc","Chỉ thắng lợi khi có sự lãnh đạo trực tiếp của Quốc tế Cộng sản"],
    ans: 0, exp: "Đây là luận điểm sáng tạo của Hồ Chí Minh, khẳng định tính chủ động của cách mạng thuộc địa, không cần thụ động chờ đợi chính quốc."
  },
  {
    q: "Hồ Chí Minh xác định lực lượng nòng cốt, trung tâm của Mặt trận đoàn kết dân tộc là gì?",
    opts: ["Liên minh công nhân - nông dân - trí thức","Chỉ giai cấp công nhân","Giai cấp tư sản dân tộc tiến bộ","Tầng lớp sĩ phu yêu nước"],
    ans: 0, exp: "Liên minh công - nông - trí thức là nền tảng vững chắc của khối đại đoàn kết toàn dân tộc trong tư tưởng Hồ Chí Minh."
  },
  {
    q: "Trong tư tưởng Hồ Chí Minh, 'Dân là gốc' có hàm nghĩa chính trị cốt lõi là gì?",
    opts: ["Nhân dân là chủ thể quyền lực, nguồn gốc của sức mạnh và tính hợp pháp của nhà nước","Dân số đông là sức mạnh kinh tế của đất nước","Nhân dân cần được nhà nước nuôi dưỡng và bảo vệ như gốc cây","Dân là tài nguyên cần được khai thác phục vụ mục tiêu quốc gia"],
    ans: 0, exp: "'Dân là gốc' khẳng định nhân dân là chủ thể tối cao: mọi quyền lực đều từ dân mà ra, phục vụ cho lợi ích của dân."
  },
  {
    q: "Điều gì được Hồ Chí Minh coi là 'vũ khí sắc bén nhất' để xây dựng Đảng về tư tưởng?",
    opts: ["Thực hành tự phê bình và phê bình","Học tập lý luận Mác-Lênin","Thanh trừng các phần tử xét lại","Tập trung quyền lực vào bộ máy kiểm tra Đảng"],
    ans: 0, exp: "Hồ Chí Minh coi tự phê bình và phê bình là quy luật phát triển của Đảng, vũ khí để Đảng tự làm sạch, tự hoàn thiện mình."
  },
  {
    q: "Hồ Chí Minh nêu 5 điều Bác Hồ dạy thiếu nhi. Điều thứ nhất là gì?",
    opts: ["Yêu Tổ quốc, yêu đồng bào","Học tập tốt, lao động tốt","Đoàn kết tốt, kỷ luật tốt","Giữ gìn vệ sinh thật tốt"],
    ans: 0, exp: "Điều 1 trong 5 điều Bác Hồ dạy: 'Yêu Tổ quốc, yêu đồng bào' – đặt tình yêu đất nước, yêu nhân dân lên hàng đầu."
  },
  {
    q: "Tác phẩm 'Bản án chế độ thực dân Pháp' (1925) của Nguyễn Ái Quốc có ý nghĩa gì?",
    opts: ["Vạch trần tội ác chủ nghĩa thực dân và thức tỉnh tinh thần đấu tranh của các dân tộc bị áp bức","Trình bày cương lĩnh thành lập Đảng Cộng sản Việt Nam","Tổng kết kinh nghiệm Cách mạng Tháng Mười Nga","Lý luận hóa quan điểm về chủ nghĩa xã hội khoa học"],
    ans: 0, exp: "'Bản án chế độ thực dân Pháp' là bức tranh toàn cảnh về tội ác thực dân, thức tỉnh nhân dân thuộc địa và phong trào cộng sản quốc tế."
  }
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
  const [screen, setScreen]   = useState('welcome');
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);

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
    <div style={{
      height:'100vh', width:'100%', background:'#080a0f',
      display:'flex', alignItems:'stretch', justifyContent:'center',
      padding:'10px', position:'relative', overflow:'hidden', fontFamily:"'Inter', sans-serif"
    }}>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'5%', left:'5%', width:500, height:500, background:'radial-gradient(circle, rgba(127,29,29,0.15) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'5%', right:'5%', width:600, height:600, background:'radial-gradient(circle, rgba(120,90,10,0.08) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      {/* Main card */}
      <div style={{
        width:'100%', maxWidth:1200, flex:1, position:'relative', zIndex:10,
        background:'rgba(12,10,8,0.85)', border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:24, padding:'32px 56px',
        backdropFilter:'blur(24px)', boxShadow:'0 30px 80px rgba(0,0,0,0.9)',
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

        <footer style={{ textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.12)', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:14, letterSpacing:3, textTransform:'uppercase', fontFamily:'monospace' }}>
          Giáo dục tích hợp game hóa cao cấp · Antigravity · 2026
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shakeFx { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes glowBoss { 0%,100%{filter:drop-shadow(0 0 8px rgba(239,68,68,0.4))} 50%{filter:drop-shadow(0 0 22px rgba(239,68,68,0.9))} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulsate { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes timerShrink { from{width:100%} to{width:0%} }
        .shake { animation: shakeFx 0.5s ease; }
        .boss-glow { animation: glowBoss 1.5s ease-in-out infinite; }
        .float { animation: floatUp 2.5s ease-in-out infinite; }
        .pulse { animation: pulsate 1.2s ease-in-out infinite; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(245,158,11,0.3); border-radius:4px; }
      `}</style>
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
// LEVEL 1 – CÔNG THÀNH CHIẾN
// ===========================================================================================
function Level1({ onWin, onLose, lives, setLives }) {
  const [questions]           = useState(() => pickQuestions(ALL_Q1, 8)); // 8 câu ngẫu nhiên mỗi lượt
  const [eHp, setEHp]         = useState(5);
  const [pHp, setPHp]         = useState(5);
  const [qIdx, setQIdx]       = useState(0);
  const [sel, setSel]         = useState(null);
  const [answered, setAnswered] = useState(false);
  const [shake, setShake]     = useState('');

  const q = questions[qIdx % questions.length];

  const confirm = () => {
    if (sel === null || answered) return;
    sfx.play('click');
    setAnswered(true);
    if (sel === q.ans) {
      sfx.play('correct');
      const next = Math.max(0, eHp - 1);
      setEHp(next);
      setShake('enemy');
      setTimeout(() => setShake(''), 500);
      if (next <= 0) setTimeout(() => onWin(500), 900);
    } else {
      sfx.play('wrong');
      const next = Math.max(0, pHp - 1);
      setPHp(next);
      setShake('player');
      setTimeout(() => setShake(''), 500);
    }
  };

  const next = () => {
    if (pHp <= 0) {
      setLives(prev => {
        const nxt = prev - 1;
        if (nxt <= 0) { onLose(); return 0; }
        setPHp(5); setSel(null); setAnswered(false);
        setQIdx(i => i + 1);
        return nxt;
      });
      return;
    }
    // Nếu hết bộ câu hỏi → reload bộ mới (câu còn lại) rồi tiếp
    setSel(null); setAnswered(false);
    const nextIdx = qIdx + 1;
    // Khi đã thắng địch (eHp=0) thì onWin đã gọi, không cần setQIdx
    setQIdx(nextIdx);
  };

  return (
    <div style={S.screen}>
      {/* Battle arena */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:16, alignItems:'center',
        background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:20, padding:'20px 24px'
      }}>
        {/* Player */}
        <CombatantCard
          emoji="🛡️" label="Lực Lượng Ta" hp={pHp} maxHp={5}
          color="#10b981" shade="rgba(16,185,129,0.15)"
          shake={shake === 'player'} flashDmg={shake === 'player'}
        />
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.15)', fontSize:28, fontWeight:900 }}>VS</div>
        {/* Enemy */}
        <CombatantCard
          emoji="🏰" label="Thành Trì Địch" hp={eHp} maxHp={5}
          color="#ef4444" shade="rgba(239,68,68,0.15)"
          shake={shake === 'enemy'} flashDmg={shake === 'enemy'}
          reverse
        />
      </div>

      {/* ── Quote Banner ── */}
      <div style={{
        position:'relative',
        background:'linear-gradient(160deg, #e8d5aa 0%, #d9c08a 40%, #c9ac6e 100%)',
        borderRadius:18,
        padding:'1.6rem 2.8rem',
        textAlign:'center',
        boxShadow:'0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.15)',
        border:'1px solid rgba(160,120,50,0.6)',
        overflow:'hidden'
      }}>
        {/* Decorative edge lines */}
        <div style={{ position:'absolute', top:10, left:18, right:18, height:1, background:'rgba(100,65,20,0.25)' }} />
        <div style={{ position:'absolute', bottom:10, left:18, right:18, height:1, background:'rgba(100,65,20,0.25)' }} />
        {/* Corner ornaments */}
        <span style={{ position:'absolute', top:5, left:10,  fontSize:13, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', top:5, right:10, fontSize:13, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', bottom:5, left:10,  fontSize:13, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <span style={{ position:'absolute', bottom:5, right:10, fontSize:13, opacity:0.35, color:'#4a2e0a' }}>✦</span>
        <p style={{
          margin:0, fontSize:15, fontWeight:700, lineHeight:1.85,
          color:'#2c1e10',
          fontFamily:"Georgia, 'Times New Roman', serif",
          textTransform:'uppercase', letterSpacing:2,
          textShadow:'0 1px 0 rgba(255,255,255,0.4)'
        }}>
          &ldquo;Đoàn kết, đoàn kết, đại đoàn kết.<br/>
          Thành công, thành công, đại thành công.&rdquo;
        </p>
        <div style={{ marginTop:10, fontSize:11, color:'#5a3a10', fontFamily:"Georgia, serif", fontStyle:'italic', opacity:0.75 }}>
          — Hồ Chí Minh
        </div>
      </div>

      {/* Question */}
      {eHp > 0 && pHp > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{
            ...S.cardDark, padding:'20px 26px', position:'relative'
          }}>
            <div style={{ position:'absolute', top:12, right:14, fontSize:10, color:S.gold, fontFamily:'monospace', letterSpacing:2, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', padding:'4px 12px', borderRadius:8 }}>
              CÂU {(qIdx % questions.length) + 1} / {questions.length}
            </div>
            <p style={{ margin:0, fontSize:16, fontWeight:700, color:'#ffffff', lineHeight:1.7, paddingRight:90 }}>
              {q.q}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {q.opts.map((opt, i) => {
              let bg = 'rgba(255,255,255,0.03)';
              let border = 'rgba(255,255,255,0.08)';
              let color = 'rgba(255,255,255,0.7)';
              if (sel === i && !answered) { bg='rgba(245,158,11,0.1)'; border=S.gold; color=S.gold; }
              if (answered) {
                if (i === q.ans)      { bg='rgba(16,185,129,0.12)'; border='#10b981'; color='#10b981'; }
                else if (sel === i)   { bg='rgba(239,68,68,0.1)'; border='#ef4444'; color='#ef4444'; }
                else                  { bg='transparent'; border='rgba(255,255,255,0.04)'; color='rgba(255,255,255,0.2)'; }
              }
              return (
                <button key={i} disabled={answered} onClick={() => { sfx.play('click'); setSel(i); }}
                  style={{
                    background:bg, border:`1px solid ${border}`, borderRadius:14,
                    padding:'16px 18px', textAlign:'left', fontSize:14, color, cursor: answered ? 'default' : 'pointer',
                    display:'flex', gap:14, alignItems:'flex-start', lineHeight:1.55,
                    transition:'all 0.2s', fontFamily:'inherit',
                  }}
                  onMouseEnter={e => { if (!answered && sel !== i) e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                  onMouseLeave={e => { if (!answered && sel !== i) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <span style={{
                    minWidth:26, height:26, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700, border:`1px solid ${border}`,
                    background: sel === i && !answered ? S.gold : 'rgba(255,255,255,0.05)',
                    color: sel === i && !answered ? '#0a0a0a' : 'inherit', flexShrink:0
                  }}>
                    {String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {!answered ? (
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <GlowButton onClick={confirm} disabled={sel === null} color="#ef4444"
                style={{ opacity: sel === null ? 0.4 : 1, cursor: sel === null ? 'not-allowed' : 'pointer', fontSize:14, padding:'15px 36px' }}>
                💥 Công Phá Thành Lũy
              </GlowButton>
            </div>
          ) : (
            <div style={{
              ...S.cardDark, padding:'18px 22px',
              display:'flex', gap:16, alignItems:'flex-start',
              animation:'fadeUp 0.3s ease forwards'
            }}>
              <span style={{ fontSize:26, flexShrink:0 }}>{sel === q.ans ? '🌱' : '💡'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color: sel === q.ans ? S.emerald : S.red, marginBottom:6, letterSpacing:1, textTransform:'uppercase' }}>
                  {sel === q.ans ? 'Tấn công thành công!' : 'Bị địch phản công!'}
                </div>
                <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.75 }}>{q.exp}</p>
              </div>
              <button onClick={next} style={{
                background:'linear-gradient(135deg, #10b981, #059669)', color:'#fff', border:'none',
                borderRadius:12, padding:'12px 22px', fontSize:12, fontWeight:700, cursor:'pointer',
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
// LEVEL 2 – DÒNG THỜI GIAN
// ===========================================================================================
function Level2({ onWin, onLose, lives, setLives }) {
  // Mỗi lượt chơi lấy 5 sự kiện ngẫu nhiên từ 11 mốc lịch sử
  const [correctOrder]        = useState(() => pickTimeline());
  const [pool, setPool]       = useState(() => shuffle([...correctOrder]));
  const [ordered, setOrdered] = useState([]);
  const [wrong, setWrong]     = useState(false);

  const pick = (ev) => {
    if (wrong) return;
    sfx.play('click');
    const remaining = pool.filter(e => !ordered.find(o => o.id === e.id));
    const minYear = Math.min(...remaining.map(e => e.year));

    if (ev.year === minYear) {
      const next = [...ordered, ev];
      setOrdered(next);
      if (next.length === correctOrder.length) {
        sfx.play('correct');
        setTimeout(() => onWin(600), 700);
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
        // Tạo một bộ mới 5 sự kiện ngẫu nhiên khác khi bị phạt
        const newSet = pickTimeline();
        setPool(shuffle([...newSet]));
        setOrdered([]);
        setWrong(false);
      }, 1400);
    }
  };

  const available = pool.filter(e => !ordered.find(o => o.id === e.id));

  return (
    <div style={S.screen}>
      <div style={{ textAlign:'center' }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:S.gold, letterSpacing:3, textTransform:'uppercase' }}>
          ⏳ Dòng Thời Gian Lịch Sử
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Nhấp chọn sự kiện cổ xưa nhất còn lại – lần lượt từ trước đến sau.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Hộp sự kiện chờ */}
        <div style={{ ...S.cardDark, padding:'18px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:10, fontFamily:'monospace', letterSpacing:2, color:S.gold, borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:8, marginBottom:4 }}>
            📥 SỰ KIỆN CHƯA SẮP XẾP
          </div>
          {available.length === 0 && ordered.length === TIMELINE.length ? (
            <div style={{ textAlign:'center', color:S.emerald, fontSize:13, fontWeight:700, padding:24 }}>
              ✨ Hoàn thành! Đang chuyển màn...
            </div>
          ) : (
            available.map(ev => (
              <button key={ev.id} onClick={() => pick(ev)} disabled={wrong}
                className={wrong ? 'shake' : ''}
                style={{
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:12, padding:'12px 14px', textAlign:'left', fontSize:12,
                  color:'rgba(255,255,255,0.7)', cursor: wrong ? 'not-allowed' : 'pointer',
                  display:'flex', gap:10, alignItems:'flex-start', lineHeight:1.5,
                  transition:'all 0.2s', fontFamily:'inherit'
                }}
                onMouseEnter={e => { if(!wrong) { e.currentTarget.style.borderColor='rgba(245,158,11,0.4)'; e.currentTarget.style.color='#fff'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
              >
                <span style={{ color:S.gold, marginTop:1 }}>◆</span>
                {ev.text}
              </button>
            ))
          )}
        </div>

        {/* Hộp thứ tự đã sắp */}
        <div style={{ ...S.cardDark, padding:'18px', display:'flex', flexDirection:'column', gap:10, position:'relative', minHeight:200 }}>
          <div style={{ fontSize:10, fontFamily:'monospace', letterSpacing:2, color:S.emerald, borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:8, marginBottom:4 }}>
            📤 THỨ TỰ ĐÃ SẮP XẾP
          </div>
          {ordered.length === 0 ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.15)', fontSize:12, flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:28 }}>⏳</span>
              Chọn sự kiện bên trái để bắt đầu
            </div>
          ) : (
            ordered.map((ev, i) => (
              <div key={ev.id} style={{
                background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
                borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center',
                gap:12, fontSize:12, color:S.emerald, animation:'fadeUp 0.3s ease'
              }}>
                <span style={{
                  minWidth:24, height:24, background:S.emerald, borderRadius:6,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:800, color:'#0a0a0a', flexShrink:0
                }}>{i+1}</span>
                <span style={{ flex:1, lineHeight:1.5 }}>{ev.text}</span>
                <span style={{
                  fontSize:11, fontFamily:'monospace', fontWeight:700,
                  background:'rgba(16,185,129,0.2)', padding:'2px 8px', borderRadius:6
                }}>{ev.year}</span>
              </div>
            ))
          )}

          {wrong && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(30,0,0,0.92)',
              border:'1px solid rgba(239,68,68,0.4)', borderRadius:18,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:8, backdropFilter:'blur(8px)'
            }}>
              <span style={{ fontSize:28 }}>⚠️</span>
              <span style={{ fontSize:12, fontWeight:700, color:S.red, letterSpacing:2, textTransform:'uppercase' }}>Sai niên đại! Đặt lại...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================================
// LEVEL 3 – LẮP GHÉP CHÂN LÝ
// ===========================================================================================
function Level3({ onWin, onLose, lives, setLives }) {
  // Chọn ngẫu nhiên 1 bộ lắp ghép trong 3 bộ có sẵn
  const [puzzle]              = useState(() => ALL_PUZZLES[Math.floor(Math.random() * ALL_PUZZLES.length)]);
  const blankKeys = ['b0','b1','b2','b3'];
  const [answers, setAnswers] = useState({ b0:'', b1:'', b2:'', b3:'' });
  const [activeBl, setActiveBl] = useState(null);
  const [wrong, setWrong]     = useState(false);
  const [done, setDone]       = useState(false);

  const pickBlank = (key) => { sfx.play('click'); setActiveBl(key); };
  const pickWord  = (word) => {
    if (!activeBl || done) return;
    sfx.play('click');
    setAnswers(a => ({ ...a, [activeBl]: word }));
    setActiveBl(null);
  };
  const clearBlank = (key, e) => {
    e.stopPropagation();
    sfx.play('click');
    setAnswers(a => ({ ...a, [key]: '' }));
  };

  const check = () => {
    const ok = blankKeys.every(k => answers[k] === puzzle.blanks[k]);
    if (ok) {
      sfx.play('correct'); setDone(true);
      setTimeout(() => onWin(700), 1200);
    } else {
      sfx.play('wrong'); setWrong(true);
      setLives(prev => {
        const nxt = prev - 1;
        if (nxt <= 0) { onLose(); return 0; }
        return nxt;
      });
      setTimeout(() => setWrong(false), 900);
    }
  };

  const usedWords = Object.values(answers).filter(Boolean);
  const bankWords = puzzle.wordBank.filter(w => !usedWords.includes(w));
  const allFilled = blankKeys.every(k => answers[k]);

  // Render text with clickable blanks
  const renderText = () => {
    const parts = puzzle.template.split(/(\{b\d\})/);
    return parts.map((part, i) => {
      const m = part.match(/\{(b\d)\}/);
      if (m) {
        const key = m[1];
        const val = answers[key];
        const isActive = activeBl === key;
        return (
          <span key={i}
            onClick={() => pickBlank(key)}
            style={{
              display:'inline-flex', alignItems:'center', gap:6,
              borderBottom:`2px solid ${isActive ? S.gold : val ? S.emerald : 'rgba(245,158,11,0.4)'}`,
              background: isActive ? 'rgba(245,158,11,0.12)' : val ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: isActive ? S.gold : val ? S.emerald : 'rgba(245,158,11,0.7)',
              borderRadius:8, padding:'3px 10px', margin:'0 4px',
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'monospace',
              transition:'all 0.2s',
              boxShadow: isActive ? '0 0 12px rgba(245,158,11,0.2)' : 'none',
              animation: isActive ? 'pulsate 1s ease-in-out infinite' : 'none'
            }}
          >
            {val ? (
              <>
                <span>{val}</span>
                <span onClick={e => clearBlank(key,e)} style={{ color:S.red, fontSize:11, fontWeight:900 }}>✕</span>
              </>
            ) : (
              <span style={{ opacity:0.6, fontSize:11, fontStyle:'italic' }}>Lắp từ</span>
            )}
          </span>
        );
      }
      return <span key={i} style={{ fontSize:14, lineHeight:2 }}>{part}</span>;
    });
  };

  return (
    <div style={S.screen}>
      <div style={{ textAlign:'center' }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:S.emerald, letterSpacing:3, textTransform:'uppercase' }}>
          📜 Lắp Ghép Chân Lý Tư Tưởng
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Nhấp ô trống → chọn từ bên dưới. Hoàn thành trích dẫn của Chủ tịch Hồ Chí Minh.
        </p>
      </div>

      <div className={wrong ? 'shake' : ''} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* Cuộn giấy */}
        <div style={{
          background:'linear-gradient(135deg, rgba(25,15,3,0.9), rgba(20,12,2,0.95))',
          border:'1px solid rgba(180,130,50,0.35)', borderRadius:20,
          padding:'22px 26px', position:'relative', overflow:'hidden'
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, transparent, rgba(180,130,50,0.5), transparent)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'linear-gradient(90deg, transparent, rgba(180,130,50,0.5), transparent)' }} />
          <div style={{ fontSize:10, color:'rgba(180,130,50,0.7)', fontFamily:'monospace', letterSpacing:2, marginBottom:12 }}>
            📜 TRÍCH "SỬA ĐỔI LỐI LÀM VIỆC" (1947):
          </div>
          <div style={{ color:'rgba(255,245,220,0.9)', fontFamily:"'Cinzel', serif", fontStyle:'italic', lineHeight:2.2 }}>
            {renderText()}
          </div>
        </div>

        {/* Word Bank */}
        <div style={{ ...S.cardDark, padding:'16px 18px' }}>
          <div style={{ fontSize:10, fontFamily:'monospace', letterSpacing:2, color:'rgba(255,255,255,0.35)', marginBottom:12 }}>
            🔤 NGÂN HÀNG TỪ KHÓA:
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {bankWords.map((w,i) => (
              <button key={i} onClick={() => pickWord(w)} disabled={!activeBl || done}
                style={{
                  background: activeBl ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${activeBl ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:10, padding:'8px 16px', fontSize:12, fontFamily:'monospace',
                  color: activeBl ? S.gold : 'rgba(255,255,255,0.4)', cursor: activeBl ? 'pointer' : 'not-allowed',
                  transition:'all 0.2s'
                }}
                onMouseEnter={e => { if(activeBl) { e.currentTarget.style.background='rgba(245,158,11,0.2)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
                onMouseLeave={e => { e.currentTarget.style.background= activeBl ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                {w}
              </button>
            ))}
          </div>
          {!activeBl && bankWords.length > 0 && (
            <p style={{ margin:'10px 0 0', fontSize:10, color:'rgba(245,158,11,0.5)', fontFamily:'monospace' }}>
              💡 Nhấp chọn ô trống (viền vàng) trong đoạn văn bên trên trước.
            </p>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:11, fontFamily:'monospace' }}>
            {wrong && <span style={{ color:S.red, fontWeight:700 }}>⚠️ Có từ sai! Kiểm tra lại và thử nộp lần nữa.</span>}
            {done  && <span style={{ color:S.emerald, fontWeight:700 }}>✅ Chân lý chính xác! Đang chuyển màn...</span>}
          </div>
          <GlowButton onClick={check} disabled={!allFilled || done} color="#10b981"
            style={{ fontSize:11, opacity: !allFilled || done ? 0.4 : 1, cursor: !allFilled || done ? 'not-allowed' : 'pointer' }}>
            Nộp Bài & Kiểm Tra ➔
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================================
// LEVEL 4 – BOSS FIGHT
// ===========================================================================================
function Level4({ onWin, onLose, lives, setLives }) {
  // Xáo trộn và lấy 8 câu ngẫu nhiên từ 12 boss statements
  const [questions]           = useState(() => pickQuestions(ALL_BOSS_Q, 8));
  const [bHp, setBHp]         = useState(questions.length); // Boss HP = số câu hỏi
  const [pHp, setPHp]         = useState(3);
  const [qIdx, setQIdx]       = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect]  = useState(false);
  const [timeLeft, setTime]    = useState(5);
  const [shake, setShake]      = useState('');
  const timerRef = useRef(null);
  const q = questions[qIdx % questions.length];

  useEffect(() => {
    if (answered) return;
    setTime(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); timeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, answered]);

  const timeout = () => {
    sfx.play('wrong'); setAnswered(true); setCorrect(false);
    setPHp(p => Math.max(0, p-1)); setShake('player'); setTimeout(() => setShake(''), 500);
    setLives(prev => { const n = prev-1; if(n<=0) onLose(); return Math.max(0,n); });
  };

  const answer = (choice) => {
    if (answered) return;
    clearInterval(timerRef.current);
    sfx.play('click');
    setAnswered(true);
    const ok = choice === q.isTrue;
    setCorrect(ok);
    if (ok) {
      sfx.play('correct');
      const n = Math.max(0, bHp-1);
      setBHp(n); setShake('boss'); setTimeout(() => setShake(''), 500);
      if (n <= 0) setTimeout(() => onWin(1000), 900);
    } else {
      sfx.play('wrong');
      const n = Math.max(0, pHp-1);
      setPHp(n); setShake('player'); setTimeout(() => setShake(''), 500);
      setLives(prev => { const nx=prev-1; if(nx<=0) onLose(); return Math.max(0,nx); });
    }
  };

  const next = () => {
    if (pHp <= 0 && lives > 0) { setPHp(3); }
    setAnswered(false);
    setQIdx(i => i+1);
  };

  return (
    <div style={S.screen}>
      <div style={{ textAlign:'center' }}>
        <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:S.red, letterSpacing:3, textTransform:'uppercase' }}>
          👹 Trận Chiến Cuối – Boss Fight
        </h3>
        <p style={{ margin:'6px 0 0', fontSize:12, color:'rgba(255,255,255,0.4)' }}>
          Phán xét Đúng/Sai trong vòng 5 giây. Phản xạ nhanh!
        </p>
      </div>

      {/* Battle field */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:16, alignItems:'center',
        background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:20, padding:'20px 24px'
      }}>
        <CombatantCard emoji="🧑‍✈️" label="Bản Lĩnh Ta" hp={pHp} maxHp={3} color="#10b981" shade="rgba(16,185,129,0.15)" shake={shake==='player'} />
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.12)', fontSize:26, fontWeight:900 }}>VS</div>
        <CombatantCard emoji="👹" label="Boss Luận Điệu" hp={bHp} maxHp={questions.length} color="#ef4444" shade="rgba(239,68,68,0.15)" shake={shake==='boss'} reverse bossMode />
      </div>

      {/* Timer bar */}
      {!answered && (
        <div style={{ background:'rgba(0,0,0,0.5)', borderRadius:999, height:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            height:'100%', borderRadius:999,
            background: timeLeft <= 2 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            width:`${(timeLeft/5)*100}%`, transition:'width 1s linear',
            boxShadow: timeLeft <= 2 ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px rgba(245,158,11,0.4)'
          }} />
        </div>
      )}

      {/* Statement card */}
      {bHp > 0 && pHp > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{
            ...S.cardDark, padding:'22px 28px', textAlign:'center', position:'relative'
          }}>
            <div className="pulse" style={{ fontSize:10, color:S.red, fontFamily:'monospace', letterSpacing:2, marginBottom:12 }}>
              ⚡ NHẬN ĐỊNH CỦA BOSS · {!answered && `${timeLeft} GIÂY`}
            </div>
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#f1f5f9', lineHeight:1.7, fontFamily:"'Cinzel', serif", fontStyle:'italic' }}>
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

