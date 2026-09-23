import Foundation
import SwiftUI

// Paleta do app (src/theme.ts).
enum Palette {
  static let bg = Color(hex: 0x0C0C25)
  static let text = Color(hex: 0xFAFAFA)
  static let textMuted = Color(hex: 0xC9C9E0)
  static let textFaint = Color(hex: 0x6E6E93)
  static let accent = Color(hex: 0xFCB69F)
  static let done = Color(hex: 0x4B4B72)
}

extension Color {
  init(hex: UInt32) {
    self.init(
      red: Double((hex >> 16) & 0xFF) / 255,
      green: Double((hex >> 8) & 0xFF) / 255,
      blue: Double(hex & 0xFF) / 255
    )
  }
}

// Dados que o app grava no App Group (ver modules/widget-bridge e
// src/widgets.ts) a cada vez que a home recarrega.
struct Snapshot: Codable {
  struct Workout: Codable {
    let name: String
    let doneOn: String? // YYYY-MM-DD, se feito na semana em que foi gravado
  }

  var anniversary: String? // YYYY-MM-DD
  var workouts: [Workout]

  // Mesmos valores do seed (src/db/seed.ts), usados antes do app abrir
  // pela primeira vez e na galeria de widgets.
  static let placeholder = Snapshot(
    anniversary: "2024-10-01",
    workouts: [
      .init(name: "Push · Chest & Triceps", doneOn: nil),
      .init(name: "Pull · Back & Biceps", doneOn: nil),
      .init(name: "Legs · Quads & Glutes", doneOn: nil),
      .init(name: "Cardio · 20 min", doneOn: nil),
    ]
  )

  static func load() -> Snapshot? {
    guard
      let json = SharedStore.defaults?.string(forKey: SharedStore.snapshotKey),
      let data = json.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(Snapshot.self, from: data)
  }
}

enum SharedStore {
  static let baseGroup = "group.com.sliftio.venus"
  static let snapshotKey = "venus.snapshot"

  // A AltStore registra o grupo como "<grupo>.<TEAMID>" e grava o nome real em
  // ALTAppGroups no Info.plist de cada bundle. Fora dela vale o nome base.
  // Só usamos um grupo cujo container existe (= entitlement válido).
  static let groupId: String? = {
    let altGroups = Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String] ?? []
    let candidates = altGroups.filter { $0.hasPrefix(baseGroup) } + [baseGroup]
    return candidates.first {
      FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: $0) != nil
    }
  }()

  static var defaults: UserDefaults? {
    groupId.flatMap { UserDefaults(suiteName: $0) }
  }
}

enum Day {
  static let calendar = Calendar(identifier: .gregorian)

  private static let keyFormatter: DateFormatter = {
    let f = DateFormatter()
    f.calendar = calendar
    f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = .current
    f.dateFormat = "yyyy-MM-dd"
    return f
  }()

  static func parse(_ key: String) -> Date? { keyFormatter.date(from: key) }

  static func between(_ from: Date, _ to: Date) -> Int {
    let a = calendar.startOfDay(for: from)
    let b = calendar.startOfDay(for: to)
    return calendar.dateComponents([.day], from: a, to: b).day ?? 0
  }

  // Segunda-feira da semana de `d` (igual a startOfWeek em src/dates.ts).
  static func startOfWeek(_ d: Date) -> Date {
    let day = calendar.startOfDay(for: d)
    let weekday = calendar.component(.weekday, from: day) // 1 = domingo
    let offset = (weekday + 5) % 7
    return calendar.date(byAdding: .day, value: -offset, to: day) ?? day
  }

  static func nextMidnight(after d: Date) -> Date {
    calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: d)) ?? d.addingTimeInterval(86_400)
  }
}
