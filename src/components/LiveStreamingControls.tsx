import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';

interface StreamingDevice {
  id: string;
  name: string;
  type: 'microphone' | 'camera' | 'screen' | 'phone';
  isAvailable: boolean;
  isActive: boolean;
}

interface LiveStreamingControlsProps {
  isLive: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  viewers: number;
}

const LiveStreamingControls: React.FC<LiveStreamingControlsProps> = ({
  isLive,
  onStartStream,
  onStopStream,
  onToggleMute,
  isMuted,
  viewers,
}) => {
  const {theme} = useTheme();
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['device-1']);

  const availableDevices: StreamingDevice[] = [
    {id: 'device-1', name: 'Built-in Microphone', type: 'microphone', isAvailable: true, isActive: true},
    {id: 'device-2', name: 'Built-in Camera', type: 'camera', isAvailable: true, isActive: false},
    {id: 'device-3', name: 'Bluetooth Headset', type: 'microphone', isAvailable: true, isActive: false},
    {id: 'device-4', name: 'Screen Share', type: 'screen', isAvailable: true, isActive: false},
    {id: 'device-5', name: 'Phone Call', type: 'phone', isAvailable: false, isActive: false},
  ];

  const handleDeviceToggle = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter(id => id !== deviceId));
    } else {
      setSelectedDevices([...selectedDevices, deviceId]);
    }
  };

  const handleStartStream = () => {
    if (selectedDevices.length === 0) {
      Alert.alert('No Devices', 'Please select at least one streaming device.');
      return;
    }
    onStartStream();
    setShowDeviceModal(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'microphone':
        return 'mic';
      case 'camera':
        return 'videocam';
      case 'screen':
        return 'screen-share';
      case 'phone':
        return 'phone';
      default:
        return 'devices';
    }
  };

  return (
    <>
      <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
        {isLive ? (
          <>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
              <Text style={[styles.viewerCount, {color: theme.colors.text}]}>
                {viewers} viewers
              </Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, {backgroundColor: theme.colors.border}]}
                onPress={onToggleMute}>
                <Icon
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#E4405F' : theme.colors.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, {backgroundColor: theme.colors.error}]}
                onPress={onStopStream}>
                <Icon name="stop" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, {backgroundColor: theme.colors.border}]}
                onPress={() => setShowDeviceModal(true)}>
                <Icon name="settings" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, {backgroundColor: theme.colors.error}]}
            onPress={() => setShowDeviceModal(true)}>
            <Icon name="fiber-manual-record" size={32} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Live Stream</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showDeviceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeviceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
                Select Streaming Devices
              </Text>
              <TouchableOpacity onPress={() => setShowDeviceModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.deviceList}>
              {availableDevices.map((device) => (
                <Animatable.View
                  key={device.id}
                  animation="fadeInUp"
                  delay={parseInt(device.id.split('-')[1]) * 50}>
                  <TouchableOpacity
                    style={[
                      styles.deviceItem,
                      {
                        backgroundColor: selectedDevices.includes(device.id)
                          ? theme.colors.primary + '20'
                          : theme.colors.background,
                        borderColor: selectedDevices.includes(device.id)
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleDeviceToggle(device.id)}
                    disabled={!device.isAvailable}>
                    <View style={styles.deviceInfo}>
                      <Icon
                        name={getDeviceIcon(device.type) as any}
                        size={24}
                        color={
                          selectedDevices.includes(device.id)
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                      />
                      <View style={styles.deviceDetails}>
                        <Text
                          style={[
                            styles.deviceName,
                            {
                              color: device.isAvailable
                                ? theme.colors.text
                                : theme.colors.textSecondary,
                            },
                          ]}>
                          {device.name}
                        </Text>
                        <Text
                          style={[
                            styles.deviceStatus,
                            {
                              color: device.isAvailable
                                ? theme.colors.success
                                : theme.colors.error,
                            },
                          ]}>
                          {device.isAvailable ? 'Available' : 'Not Available'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedDevices.includes(device.id) && styles.checkboxSelected,
                        {backgroundColor: theme.colors.primary},
                      ]}>
                      {selectedDevices.includes(device.id) && (
                        <Icon name="check" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: theme.colors.border}]}
                onPress={() => setShowDeviceModal(false)}>
                <Text style={[styles.modalButtonText, {color: theme.colors.text}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: theme.colors.error}]}
                onPress={handleStartStream}>
                <Text style={styles.modalButtonText}>Start Streaming</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF0069',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
  },
  viewerCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deviceList: {
    padding: 16,
    maxHeight: 400,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1DA1F2',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LiveStreamingControls;
