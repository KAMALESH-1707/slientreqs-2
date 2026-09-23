import heroAircraft from '../assets/images/silentresq_hero_aircraft_1790154394489.jpg';
import airframeStudio from '../assets/images/airframe_studio_1790154819111.jpg';
import vtolLiftMotor from '../assets/images/vtol_lift_motor_1790154430225.jpg';
import vtolEsc from '../assets/images/vtol_esc_1790154531115.jpg';
import vtolPropellers from '../assets/images/vtol_propellers_1790154549294.jpg';
import cruiseMotor from '../assets/images/cruise_motor_1790154561528.jpg';
import cruiseEsc from '../assets/images/cruise_esc_1790154779386.jpg';
import cruisePropeller from '../assets/images/cruise_propeller_1790154801846.jpg';
import flightController from '../assets/images/flight_controller_1790154503414.jpg';
import gpsCompass from '../assets/images/gps_compass_1790154578031.jpg';
import airspeedPitot from '../assets/images/airspeed_pitot_1790154593985.jpg';
import barometerSensor from '../assets/images/barometer_sensor_1790154768120.jpg';
import controlServos from '../assets/images/control_servos_1790154649498.jpg';
import rcReceiver from '../assets/images/rc_receiver_1790154705325.jpg';
import telemetryRadio from '../assets/images/telemetry_radio_1790154688544.jpg';
import powerModule from '../assets/images/power_module_1790154678095.jpg';
import pdbBoard from '../assets/images/pdb_board_1790154719322.jpg';
import battery6s from '../assets/images/battery_6s_1790154607023.jpg';
import dcBecRegulator from '../assets/images/dc_bec_regulator_1790154732208.jpg';
import wiringSafety from '../assets/images/wiring_safety_1790154749904.jpg';
import jetsonOrinNano from '../assets/images/jetson_orin_nano_1790154466553.jpg';
import rgbCamera from '../assets/images/rgb_camera_1790154515385.jpg';
import thermalCamera from '../assets/images/thermal_camera_1790154486215.jpg';
import onboardStorage from '../assets/images/onboard_storage_1790154664760.jpg';
import loraModule from '../assets/images/lora_module_1790154621433.jpg';
import groundLoraGw from '../assets/images/ground_lora_gw_1790154637248.jpg';

export const HERO_AIRCRAFT_IMAGE = heroAircraft;

export const COMPONENT_IMAGES: Record<string, string> = {
  'hybrid-airframe': airframeStudio,
  'vtol-motor': vtolLiftMotor,
  'vtol-esc': vtolEsc,
  'vtol-propeller': vtolPropellers,
  'cruise-motor': cruiseMotor,
  'cruise-esc': cruiseEsc,
  'cruise-propeller': cruisePropeller,
  'flight-controller': flightController,
  'gps-compass': gpsCompass,
  'airspeed-pitot': airspeedPitot,
  'barometer': barometerSensor,
  'servos': controlServos,
  'rc-receiver': rcReceiver,
  'telemetry-radio': telemetryRadio,
  'power-module': powerModule,
  'power-distribution': pdbBoard,
  'battery-6s': battery6s,
  'dc-dc-bec': dcBecRegulator,
  'wiring-safety': wiringSafety,
  'jetson': jetsonOrinNano,
  'rgb-camera': rgbCamera,
  'thermal-camera': thermalCamera,
  'onboard-storage': onboardStorage,
  'lora-module': loraModule,
  'ground-lora-gateway': groundLoraGw
};

export const getComponentImage = (componentId: string): string => {
  return COMPONENT_IMAGES[componentId] || airframeStudio;
};
