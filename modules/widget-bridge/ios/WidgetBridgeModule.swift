import ExpoModulesCore
import WidgetKit

// Ponte app → widgets: grava o snapshot (JSON) no App Group compartilhado com a
// extensão (targets/widget) e pede ao WidgetKit para redesenhar.
public class WidgetBridgeModule: Module {
  static let baseGroup = "group.com.sliftio.venus"
  static let snapshotKey = "venus.snapshot"

  // Mesma resolução de targets/widget/Shared.swift: a AltStore renomeia o grupo
  // para "<grupo>.<TEAMID>" e informa o nome real em ALTAppGroups.
  static let groupId: String? = {
    let altGroups = Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String] ?? []
    let candidates = altGroups.filter { $0.hasPrefix(baseGroup) } + [baseGroup]
    return candidates.first {
      FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: $0) != nil
    }
  }()

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    // Grupo em uso, ou null se o app não tem o entitlement (widgets sem dados).
    Function("appGroup") { () -> String? in
      Self.groupId
    }

    Function("setSnapshot") { (json: String) -> Bool in
      guard let groupId = Self.groupId, let defaults = UserDefaults(suiteName: groupId) else {
        return false
      }
      defaults.set(json, forKey: Self.snapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
      return true
    }
  }
}
