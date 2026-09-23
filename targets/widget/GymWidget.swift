import SwiftUI
import WidgetKit

// Academia — treinos feitos na semana (seg → dom) e o próximo da fila.
struct GymWidget: Widget {
  let kind = "GymWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VenusProvider()) { entry in
      GymView(entry: entry)
        .containerBackground(Palette.bg, for: .widget)
        .widgetURL(URL(string: "venus://gym"))
    }
    .configurationDisplayName("Academia")
    .description("Treinos feitos nesta semana e o próximo.")
    .supportedFamilies([.systemSmall])
  }
}

struct GymView: View {
  let entry: VenusEntry

  // Recalcula a semana na data da entrada: um treino gravado na semana
  // passada deixa de contar sozinho na segunda-feira.
  private var done: [Bool] {
    let monday = Day.startOfWeek(entry.date)
    let nextMonday = Day.calendar.date(byAdding: .day, value: 7, to: monday) ?? monday
    return entry.snapshot.workouts.map { w in
      guard let key = w.doneOn, let d = Day.parse(key) else { return false }
      return d >= monday && d < nextMonday
    }
  }

  private var next: String {
    let workouts = entry.snapshot.workouts
    if workouts.isEmpty { return "No workouts" }
    guard let i = done.firstIndex(of: false) else { return "Week done" }
    // "Legs · Quads & Glutes" → "Legs"
    let name = workouts[i].name
    return name.components(separatedBy: " · ").first ?? name
  }

  var body: some View {
    let flags = done
    VStack(alignment: .leading, spacing: 0) {
      Text("ACADEMIA")
        .font(.system(size: 10, weight: .medium))
        .tracking(2)
        .foregroundStyle(Palette.textFaint)
      Spacer(minLength: 0)
      Text("\(flags.filter { $0 }.count)/\(flags.count)")
        .font(.system(size: 44, weight: .thin))
        .foregroundStyle(Palette.text)
        .minimumScaleFactor(0.6)
        .lineLimit(1)
      Text("this week")
        .font(.system(size: 12))
        .foregroundStyle(Palette.textMuted)
      Spacer(minLength: 6)
      HStack(spacing: 5) {
        ForEach(flags.indices, id: \.self) { i in
          Circle()
            .fill(flags[i] ? Palette.accent : Palette.done)
            .frame(width: 6, height: 6)
        }
      }
      Text(next)
        .font(.system(size: 13))
        .foregroundStyle(flags.allSatisfy { $0 } && !flags.isEmpty ? Palette.accent : Palette.text)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        .padding(.top, 6)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }
}
