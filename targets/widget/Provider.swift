import WidgetKit

struct VenusEntry: TimelineEntry {
  let date: Date
  let snapshot: Snapshot
}

// Um único provider para os dois widgets: uma entrada agora e uma em cada
// meia-noite seguinte, para o contador de dias, a frase do dia e a virada da
// semana da academia mudarem sozinhos. O app força um reload ao gravar.
struct VenusProvider: TimelineProvider {
  func placeholder(in context: Context) -> VenusEntry {
    VenusEntry(date: .now, snapshot: .placeholder)
  }

  func getSnapshot(in context: Context, completion: @escaping (VenusEntry) -> Void) {
    completion(VenusEntry(date: .now, snapshot: Snapshot.load() ?? .placeholder))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<VenusEntry>) -> Void) {
    let snapshot = Snapshot.load() ?? .placeholder
    var entries = [VenusEntry(date: .now, snapshot: snapshot)]
    var next = Day.nextMidnight(after: .now)
    for _ in 0..<3 {
      entries.append(VenusEntry(date: next, snapshot: snapshot))
      next = Day.nextMidnight(after: next)
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}
