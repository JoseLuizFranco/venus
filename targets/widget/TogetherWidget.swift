import SwiftUI
import WidgetKit

// Together — dias de namoro + uma expressão em mandarim que muda todo dia.
struct TogetherWidget: Widget {
  let kind = "TogetherWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VenusProvider()) { entry in
      TogetherView(entry: entry)
        .containerBackground(Palette.bg, for: .widget)
        .widgetURL(URL(string: "venus://reflection"))
    }
    .configurationDisplayName("Together")
    .description("Dias juntos e uma expressão em mandarim por dia.")
    .supportedFamilies([.systemSmall])
  }
}

struct TogetherView: View {
  let entry: VenusEntry

  private var phrase: Phrase { Phrase.of(entry.date) }

  private var days: Int? {
    guard let key = entry.snapshot.anniversary, let start = Day.parse(key) else { return nil }
    return Day.between(start, entry.date)
  }

  var body: some View {
    VStack(spacing: 0) {
      Spacer(minLength: 0)
      Text(phrase.hanzi)
        .font(.system(size: 40, weight: .light))
        .foregroundStyle(Palette.text)
        .lineLimit(1)
        .minimumScaleFactor(0.45)
      Text(phrase.pinyin)
        .font(.system(size: 10))
        .tracking(1.5)
        .foregroundStyle(Palette.textFaint)
        .lineLimit(1)
        .minimumScaleFactor(0.7)
        .padding(.top, 4)
      Text(phrase.meaning)
        .font(.system(size: 12))
        .foregroundStyle(Palette.textMuted)
        .multilineTextAlignment(.center)
        .lineLimit(2)
        .minimumScaleFactor(0.8)
        .padding(.top, 2)
      Spacer(minLength: 6)
      HStack(spacing: 4) {
        Text("♡").foregroundStyle(Palette.accent)
        Text(days.map { "\($0) days" } ?? "— days").foregroundStyle(Palette.textMuted)
      }
      .font(.system(size: 13))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

struct Phrase {
  let hanzi: String
  let pinyin: String
  let meaning: String

  // Mesma frase para o dia inteiro; percorre a lista em ordem, dia após dia.
  static func of(_ date: Date) -> Phrase {
    let epoch = Day.calendar.date(from: DateComponents(year: 2024, month: 1, day: 1))!
    let n = Day.between(epoch, date)
    return all[((n % all.count) + all.count) % all.count]
  }

  static let all: [Phrase] = [
    .init(hanzi: "坚持", pinyin: "Jiānchí", meaning: "Perseverance"),
    .init(hanzi: "缘分", pinyin: "Yuánfèn", meaning: "The fate that brought us together"),
    .init(hanzi: "陪伴", pinyin: "Péibàn", meaning: "Being there for each other"),
    .init(hanzi: "执子之手", pinyin: "Zhí zǐ zhī shǒu", meaning: "I hold your hand"),
    .init(hanzi: "信任", pinyin: "Xìnrèn", meaning: "Trust"),
    .init(hanzi: "温柔", pinyin: "Wēnróu", meaning: "Tenderness"),
    .init(hanzi: "心心相印", pinyin: "Xīn xīn xiāng yìn", meaning: "Two hearts in tune"),
    .init(hanzi: "勇气", pinyin: "Yǒngqì", meaning: "Courage"),
    .init(hanzi: "耐心", pinyin: "Nàixīn", meaning: "Patience"),
    .init(hanzi: "幸福", pinyin: "Xìngfú", meaning: "Happiness"),
    .init(hanzi: "白头偕老", pinyin: "Bái tóu xié lǎo", meaning: "Growing old together"),
    .init(hanzi: "希望", pinyin: "Xīwàng", meaning: "Hope"),
    .init(hanzi: "感恩", pinyin: "Gǎn'ēn", meaning: "Gratitude"),
    .init(hanzi: "默契", pinyin: "Mòqì", meaning: "Understanding without words"),
    .init(hanzi: "珍惜", pinyin: "Zhēnxī", meaning: "To cherish"),
    .init(hanzi: "一见钟情", pinyin: "Yī jiàn zhōng qíng", meaning: "Love at first sight"),
    .init(hanzi: "承诺", pinyin: "Chéngnuò", meaning: "A promise"),
    .init(hanzi: "心动", pinyin: "Xīndòng", meaning: "A heart that skips a beat"),
    .init(hanzi: "平安", pinyin: "Píng'ān", meaning: "Peace and safety"),
    .init(hanzi: "天长地久", pinyin: "Tiān cháng dì jiǔ", meaning: "As lasting as heaven and earth"),
    .init(hanzi: "思念", pinyin: "Sīniàn", meaning: "Missing you"),
    .init(hanzi: "家", pinyin: "Jiā", meaning: "Home"),
    .init(hanzi: "相守", pinyin: "Xiāngshǒu", meaning: "Staying by each other's side"),
    .init(hanzi: "知足", pinyin: "Zhīzú", meaning: "Contentment"),
    .init(hanzi: "在一起", pinyin: "Zài yīqǐ", meaning: "Together"),
    .init(hanzi: "初心", pinyin: "Chūxīn", meaning: "The feeling from the very start"),
    .init(hanzi: "成长", pinyin: "Chéngzhǎng", meaning: "Growing"),
    .init(hanzi: "笑", pinyin: "Xiào", meaning: "Smile"),
    .init(hanzi: "梦想", pinyin: "Mèngxiǎng", meaning: "Dream"),
    .init(hanzi: "永远", pinyin: "Yǒngyuǎn", meaning: "Forever"),
    .init(hanzi: "我爱你", pinyin: "Wǒ ài nǐ", meaning: "I love you"),
  ]
}
