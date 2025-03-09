// src/components/ShotTable.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import theme from "../ui/theme";

const outcomes = ["Good", "Neutral", "Bad"];
const shotTypes = ["drive", "iron", "chip", "putt"];

// Get screen width for calculations
const screenWidth = Dimensions.get('window').width;

export default function ShotTable({ shotCounts, activeColumn, setActiveColumn, addShot, removeShot }) {
  if (!shotCounts) {
    return <View><Text>Unable to display shot data</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.shotTypeCell}>
          <Text style={styles.headerText}>Shot Type</Text>
        </View>
        
        {/* Outcome Headers */}
        {outcomes.map((outcome) => (
          <TouchableOpacity
            key={outcome}
            onPress={() => setActiveColumn(outcome)}
            style={[
              styles.outcomeCell,
              activeColumn === outcome ? styles.activeOutcomeCell : styles.inactiveOutcomeCell
            ]}
          >
            <Text style={[
              styles.headerText,
              activeColumn === outcome ? styles.activeHeaderText : null
            ]}>
              {outcome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Data Rows */}
      {shotTypes.map((type) => (
        <View key={type} style={styles.dataRow}>
          {/* Shot Type */}
          <View style={styles.shotTypeCell}>
            <Text style={styles.shotTypeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
          </View>
          
          {/* Outcome Cells */}
          {outcomes.map((outcome) => {
            const count = shotCounts[type] && 
                          typeof shotCounts[type][outcome] === 'number' ? 
                          shotCounts[type][outcome] : 0;
            
            const isActive = activeColumn === outcome;
            
            return (
              <TouchableOpacity
                key={outcome}
                onPress={() => !isActive && setActiveColumn(outcome)}
                style={[
                  styles.outcomeCell,
                  isActive ? styles.activeOutcomeCell : styles.inactiveOutcomeCell,
                  count > 0 && !isActive && styles.hasValueCell
                ]}
              >
                {isActive ? (
                  <View style={styles.controlsContainer}>
                    <TouchableOpacity
                      onPress={() => removeShot(type, outcome)}
                      disabled={count === 0}
                      style={[styles.button, count === 0 && styles.disabledButton]}
                    >
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.countText}>{count}</Text>
                    
                    <TouchableOpacity
                      onPress={() => addShot(type, outcome)}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[
                    styles.countValueText,
                    count > 0 && styles.highlightedCountText
                  ]}>
                    {count}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginVertical: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 80,
  },
  shotTypeCell: {
    width: '25%',
    justifyContent: 'center',
    paddingLeft: 12,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  outcomeCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOutcomeCell: {
    width: '45%',
    backgroundColor: "#e6f2ff",
  },
  inactiveOutcomeCell: {
    width: '15%',
  },
  hasValueCell: {
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  activeHeaderText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  shotTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  countText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 35,
  },
  countValueText: {
    fontSize: 16,
    fontWeight: "500",
  },
  highlightedCountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  }
});