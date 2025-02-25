// src/components/ShotTable.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DataTable } from "react-native-paper";
import theme from "../ui/theme";

const outcomes = ["Good", "Neutral", "Bad"];
const shotTypes = ["drive", "iron", "chip", "putt"];

/**
 * ShotTable Component
 *
 * Displays shot counts for each shot type and outcome.
 * Users can tap to update shot counts and switch active outcome columns.
 *
 * Props:
 * - shotCounts: Object with shot counts for the current hole.
 * - activeColumn: The currently active outcome column.
 * - setActiveColumn: Function to change the active outcome.
 * - addShot: Function to add a shot.
 * - removeShot: Function to remove a shot.
 */
export default function ShotTable({ shotCounts, activeColumn, setActiveColumn, addShot, removeShot }) {
  return (
    <ScrollView horizontal>
      <DataTable>
        {/* Header Row */}
        <DataTable.Header style={styles.header}>
          <DataTable.Title style={styles.stickyColumn}>
            <Text style={styles.headerText}>Shot Type</Text>
          </DataTable.Title>
          {outcomes.map((outcome) => (
            <DataTable.Title key={outcome}>
              <View style={styles.outcomeHeaderContainer}>
                <TouchableOpacity onPress={() => setActiveColumn(outcome)}>
                  <Text style={[styles.headerText, activeColumn === outcome && styles.activeHeader]}>
                    {outcome}
                  </Text>
                </TouchableOpacity>
              </View>
            </DataTable.Title>
          ))}
        </DataTable.Header>
        {/* Data Rows */}
        {shotTypes.map((type) => (
          <DataTable.Row key={type}>
            <DataTable.Cell style={styles.stickyColumn}>
              <Text style={styles.cellText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </DataTable.Cell>
            {outcomes.map((outcome) => (
              <DataTable.Cell key={outcome}>
                <View style={styles.outcomeCellContainer}>
                  {activeColumn === outcome ? (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={() => removeShot(type, outcome)}
                        disabled={shotCounts[type][outcome] === 0}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.cellButton}
                      >
                        <Text style={styles.buttonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.countText}>{shotCounts[type][outcome]}</Text>
                      <TouchableOpacity
                        onPress={() => addShot(type, outcome)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.cellButton}
                      >
                        <Text style={styles.buttonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setActiveColumn(outcome)}>
                      <Text style={[styles.cellText, shotCounts[type][outcome] > 0 && styles.activeCellText]}>
                        {shotCounts[type][outcome]}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  stickyColumn: {
    width: 90,
    flex: 0,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  activeHeader: {
    backgroundColor: "#f0f0f0",
  },
  outcomeHeaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outcomeCellContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 16,
    textAlign: "center",
  },
  activeCellText: {
    color: theme.colors.primary,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cellButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    marginHorizontal: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  countText: {
    fontSize: 16,
    textAlign: "center",
    minWidth: 30,
  },
});
