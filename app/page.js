'use client';

import React, { useState } from 'react';

const AlarmApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('group');
  const [swipedItem, setSwipedItem] = useState(null);
  
  // Alarm groups state
  const [alarmGroups, setAlarmGroups] = useState([
    {
      id: 1,
      name: '출근 알람',
      time: '07:30',
      enabled: true,
      days: ['월', '화', '수', '목', '금'],
      alarms: [
        { time: '07:30', enabled: true },
        { time: '07:35', enabled: true },
        { time: '07:40', enabled: true },
      ]
    },
    {
      id: 2,
      name: '주말 알람',
      time: '10:30',
      enabled: true,
      days: ['토', '일'],
      alarms: [
        { time: '10:30', enabled: true },
      ]
    },
    {
      id: 3,
      name: '운동',
      time: '06:00',
      enabled: false,
      days: ['월', '수', '금'],
      alarms: [
        { time: '06:00', enabled: false },
      ]
    }
  ]);

  const [ungroupedAlarms, setUngroupedAlarms] = useState([
    { id: 1, time: '14:00', enabled: true, days: ['월', '화', '수', '목', '금', '토', '일'] },
    { id: 2, time: '18:30', enabled: false, days: ['평일'] },
  ]);

  // New alarm form state
  const [newAlarm, setNewAlarm] = useState({
    hour: 7,
    minute: 0,
    sleepPreset: null,
    interval: null,
    count: null,
    name: '',
    days: ['월', '화', '수', '목', '금'],
    excludeHolidays: true,
    sound: '기본'
  });

  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Calculate next alarm time
  const getNextAlarmText = () => {
    const now = new Date();
    let nextAlarm = null;
    let minDiff = Infinity;

    alarmGroups.forEach(group => {
      if (group.enabled) {
        const [hours, minutes] = group.time.split(':').map(Number);
        const alarmDate = new Date();
        alarmDate.setHours(hours, minutes, 0, 0);
        if (alarmDate <= now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }
        const diff = alarmDate - now;
        if (diff < minDiff) {
          minDiff = diff;
          nextAlarm = alarmDate;
        }
      }
    });

    if (!nextAlarm) return null;

    const hours = Math.floor(minDiff / (1000 * 60 * 60));
    const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분 후에 울려요`;
  };

  // Toggle alarm group
  const toggleGroup = (id) => {
    setAlarmGroups(groups =>
      groups.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g)
    );
  };

  // Toggle ungrouped alarm
  const toggleUngrouped = (id) => {
    setUngroupedAlarms(alarms =>
      alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    );
  };

  // Delete alarm group
  const deleteGroup = (id) => {
    setAlarmGroups(groups => groups.filter(g => g.id !== id));
    setSwipedItem(null);
  };

  // Handle day toggle
  const toggleDay = (day) => {
    setNewAlarm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  // Handle weekday/weekend quick select
  const selectWeekdays = () => {
    setNewAlarm(prev => ({
      ...prev,
      days: ['월', '화', '수', '목', '금']
    }));
  };

  const selectWeekend = () => {
    setNewAlarm(prev => ({
      ...prev,
      days: ['토', '일']
    }));
  };

  // Sleep time presets
  const sleepPresets = [
    { label: '4시간 30분', hours: 4, minutes: 30 },
    { label: '6시간', hours: 6, minutes: 0 },
    { label: '7시간 30분', hours: 7, minutes: 30 },
  ];

  const applySleepPreset = (preset) => {
    const now = new Date();
    const wakeTime = new Date(now.getTime() + (preset.hours * 60 + preset.minutes) * 60 * 1000);
    setNewAlarm(prev => ({
      ...prev,
      hour: wakeTime.getHours(),
      minute: wakeTime.getMinutes(),
      sleepPreset: preset.label
    }));
  };

  // Create alarm
  const createAlarm = () => {
    const timeStr = `${String(newAlarm.hour).padStart(2, '0')}:${String(newAlarm.minute).padStart(2, '0')}`;
    const alarms = [];
    
    if (newAlarm.interval && newAlarm.count) {
      for (let i = 0; i < newAlarm.count; i++) {
        const totalMinutes = newAlarm.hour * 60 + newAlarm.minute + (i * newAlarm.interval);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        alarms.push({
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          enabled: true
        });
      }
    } else {
      alarms.push({ time: timeStr, enabled: true });
    }

    const newGroup = {
      id: Date.now(),
      name: newAlarm.name || '새 알람',
      time: timeStr,
      enabled: true,
      days: newAlarm.days,
      alarms
    };

    setAlarmGroups(prev => [...prev, newGroup]);
    setCurrentView('home');
    setNewAlarm({
      hour: 7,
      minute: 0,
      sleepPreset: null,
      interval: null,
      count: null,
      name: '',
      days: ['월', '화', '수', '목', '금'],
      excludeHolidays: true,
      sound: '기본'
    });
  };

  // Get preview text for alarm creation
  const getPreviewText = () => {
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(newAlarm.hour, newAlarm.minute, 0, 0);
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    const diff = alarmTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (newAlarm.interval && newAlarm.count) {
      return `${hours}시간 ${minutes}분 후에 알람이 ${newAlarm.interval}분 간격으로 ${newAlarm.count}번 울려요!`;
    }
    return `${hours}시간 ${minutes}분 후에 울려요!`;
  };

  // Home View
  const HomeView = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingBottom: '100px',
      maxWidth: '430px',
      margin: '0 auto'
    }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="white">
            <path d="M1 4.5C1 3.67 1.67 3 2.5 3h2C5.33 3 6 3.67 6 4.5v3c0 .83-.67 1.5-1.5 1.5h-2C1.67 9 1 8.33 1 7.5v-3z"/>
            <path d="M7 3.5C7 2.67 7.67 2 8.5 2h2c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-2C7.67 9 7 8.33 7 7.5v-4z"/>
            <path d="M13 2.5c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5-.67-1.5-1.5v-5z"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <path d="M8 2.4c2.5 0 4.8 1 6.4 2.6.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0C11.9 4.7 10 4 8 4s-3.9.7-5.3 2.1c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1C3.2 3.4 5.5 2.4 8 2.4zm0 3.2c1.6 0 3 .6 4.1 1.7.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.8-.8-1.9-1.2-3-1.2s-2.2.4-3 1.2c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1 1.1-1.1 2.5-1.7 4.1-1.7zm0 3.2c.7 0 1.3.3 1.8.8.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.4-.4-1-.4-1.4 0-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1.5-.5 1.1-.8 1.8-.8z"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="white">
            <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="white" strokeWidth="1" fill="none"/>
            <rect x="2" y="3" width="17" height="6" rx="1" fill="#34C759"/>
            <path d="M23 4v4c.8-.5 1.3-1.4 1.3-2s-.5-1.5-1.3-2z" fill="white" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 24px 16px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>알람</h1>
        <button style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>

      {/* Next Alarm Info */}
      {getNextAlarmText() && (
        <div style={{
          padding: '0 24px 20px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '15px'
        }}>
          {getNextAlarmText()}
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        margin: '0 24px 24px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '4px'
      }}>
        <button
          onClick={() => setActiveTab('group')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'group' ? '#6366f1' : 'transparent',
            color: 'white',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          그룹
        </button>
        <button
          onClick={() => setActiveTab('ungrouped')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'ungrouped' ? '#6366f1' : 'transparent',
            color: 'white',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          미그룹
        </button>
      </div>

      {/* Alarm List */}
      <div style={{ padding: '0 24px' }}>
        {activeTab === 'group' ? (
          alarmGroups.map(group => (
            <div
              key={group.id}
              style={{
                position: 'relative',
                marginBottom: '16px',
                overflow: 'hidden',
                borderRadius: '16px'
              }}
            >
              {/* Swipe Actions */}
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                transform: swipedItem === group.id ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease'
              }}>
                <button
                  onClick={() => {
                    setSwipedItem(null);
                  }}
                  style={{
                    width: '70px',
                    background: 'rgba(120,120,128,0.5)',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 3a9 9 0 109 9 9 9 0 00-9-9zm0 16a7 7 0 117-7 7 7 0 01-7 7z"/>
                    <path d="M12 7v5l3 3"/>
                  </svg>
                  <span style={{ color: 'white', fontSize: '11px' }}>하루만 끄기</span>
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  style={{
                    width: '70px',
                    background: '#ff3b30',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    borderRadius: '0 16px 16px 0'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span style={{ color: 'white', fontSize: '11px' }}>삭제</span>
                </button>
              </div>

              {/* Alarm Card */}
              <div
                onClick={() => setSwipedItem(swipedItem === group.id ? null : group.id)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '20px',
                  transform: swipedItem === group.id ? 'translateX(-140px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: '500'
                  }}>
                    {group.name}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', opacity: 0.6 }}>☽</span>
                    <span style={{
                      fontSize: '42px',
                      fontWeight: '300',
                      letterSpacing: '-2px'
                    }}>
                      {group.time}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group.id);
                    }}
                    style={{
                      width: '51px',
                      height: '31px',
                      borderRadius: '16px',
                      background: group.enabled ? '#6366f1' : 'rgba(120,120,128,0.32)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '27px',
                      height: '27px',
                      borderRadius: '14px',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: group.enabled ? '22px' : '2px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '12px',
                  flexWrap: 'wrap'
                }}>
                  {group.days.map(day => (
                    <span
                      key={day}
                      style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {day}
                    </span>
                  ))}
                  {group.alarms.length > 1 && (
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'rgba(99,102,241,0.2)',
                      borderRadius: '6px',
                      color: '#818cf8'
                    }}>
                      +{group.alarms.length - 1}개 알람
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          ungroupedAlarms.map(alarm => (
            <div
              key={alarm.id}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', opacity: 0.6 }}>☽</span>
                  <span style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    letterSpacing: '-2px'
                  }}>
                    {alarm.time}
                  </span>
                </div>
                <div
                  onClick={() => toggleUngrouped(alarm.id)}
                  style={{
                    width: '51px',
                    height: '31px',
                    borderRadius: '16px',
                    background: alarm.enabled ? '#6366f1' : 'rgba(120,120,128,0.32)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '27px',
                    height: '27px',
                    borderRadius: '14px',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: alarm.enabled ? '22px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setCurrentView('create')}
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: '#6366f1',
          border: 'none',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );

  // Create Alarm View
  const CreateView = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingBottom: '120px',
      maxWidth: '430px',
      margin: '0 auto'
    }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="white">
            <path d="M1 4.5C1 3.67 1.67 3 2.5 3h2C5.33 3 6 3.67 6 4.5v3c0 .83-.67 1.5-1.5 1.5h-2C1.67 9 1 8.33 1 7.5v-3z"/>
            <path d="M7 3.5C7 2.67 7.67 2 8.5 2h2c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-2C7.67 9 7 8.33 7 7.5v-4z"/>
            <path d="M13 2.5c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5-.67-1.5-1.5v-5z"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <path d="M8 2.4c2.5 0 4.8 1 6.4 2.6.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0C11.9 4.7 10 4 8 4s-3.9.7-5.3 2.1c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1C3.2 3.4 5.5 2.4 8 2.4zm0 3.2c1.6 0 3 .6 4.1 1.7.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.8-.8-1.9-1.2-3-1.2s-2.2.4-3 1.2c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1 1.1-1.1 2.5-1.7 4.1-1.7zm0 3.2c.7 0 1.3.3 1.8.8.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.4-.4-1-.4-1.4 0-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1.5-.5 1.1-.8 1.8-.8z"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="white">
            <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="white" strokeWidth="1" fill="none"/>
            <rect x="2" y="3" width="17" height="6" rx="1" fill="#34C759"/>
            <path d="M23 4v4c.8-.5 1.3-1.4 1.3-2s-.5-1.5-1.3-2z" fill="white" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 24px 16px',
        position: 'relative'
      }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            marginLeft: '-8px'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '17px',
          fontWeight: '600',
          margin: 0
        }}>
          알람 생성
        </h1>
      </div>

      {/* Preview Banner */}
      <div style={{
        margin: '0 24px 24px',
        padding: '16px 20px',
        background: 'rgba(99,102,241,0.15)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>💡</span>
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
          {getPreviewText()}
        </span>
      </div>

      {/* Time Picker */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        padding: '0 24px'
      }}>
        <span style={{ fontSize: '20px', opacity: 0.6, marginRight: '8px' }}>☽</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '80px'
          }}>
            {[newAlarm.hour - 2, newAlarm.hour - 1, newAlarm.hour, newAlarm.hour + 1, newAlarm.hour + 2].map((h, i) => {
              const hour = ((h % 24) + 24) % 24;
              const isCenter = i === 2;
              return (
                <div
                  key={i}
                  onClick={() => isCenter ? null : setNewAlarm(prev => ({ ...prev, hour, sleepPreset: null }))}
                  style={{
                    fontSize: isCenter ? '32px' : '18px',
                    fontWeight: isCenter ? '600' : '400',
                    color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    cursor: isCenter ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {String(hour).padStart(2, '0')}
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: '32px', fontWeight: '300', color: 'rgba(255,255,255,0.5)' }}>:</span>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '80px'
          }}>
            {[newAlarm.minute - 2, newAlarm.minute - 1, newAlarm.minute, newAlarm.minute + 1, newAlarm.minute + 2].map((m, i) => {
              const minute = ((m % 60) + 60) % 60;
              const isCenter = i === 2;
              return (
                <div
                  key={i}
                  onClick={() => isCenter ? null : setNewAlarm(prev => ({ ...prev, minute, sleepPreset: null }))}
                  style={{
                    fontSize: isCenter ? '32px' : '18px',
                    fontWeight: isCenter ? '600' : '400',
                    color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    cursor: isCenter ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {String(minute).padStart(2, '0')}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sleep Presets */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '8px',
        padding: '0 24px'
      }}>
        {sleepPresets.map(preset => (
          <button
            key={preset.label}
            onClick={() => applySleepPreset(preset)}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              border: 'none',
              background: newAlarm.sleepPreset === preset.label ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '32px'
      }}>
        수면 시간으로 설정할 수 있어요!
      </p>

      {/* Options Section */}
      <div style={{ padding: '0 24px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '16px',
          color: 'rgba(255,255,255,0.9)'
        }}>
          생성 옵션
        </h3>
        
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div
            onClick={() => setShowIntervalPicker(!showIntervalPicker)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <span style={{ fontSize: '15px' }}>생성 간격</span>
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>
              {newAlarm.interval ? `${newAlarm.interval}분` : '없음'}
            </span>
          </div>
          {showIntervalPicker && (
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              flexWrap: 'wrap',
              background: 'rgba(0,0,0,0.2)'
            }}>
              {[null, 3, 5, 10, 15].map(interval => (
                <button
                  key={interval ?? 'none'}
                  onClick={() => {
                    setNewAlarm(prev => ({ ...prev, interval }));
                    setShowIntervalPicker(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: newAlarm.interval === interval ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {interval ? `${interval}분` : '없음'}
                </button>
              ))}
            </div>
          )}
          
          <div
            onClick={() => setShowCountPicker(!showCountPicker)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '15px' }}>생성 횟수</span>
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>
              {newAlarm.count ? `${newAlarm.count}번` : '없음'}
            </span>
          </div>
          {showCountPicker && (
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              flexWrap: 'wrap',
              background: 'rgba(0,0,0,0.2)'
            }}>
              {[null, 2, 3, 5, 8, 10].map(count => (
                <button
                  key={count ?? 'none'}
                  onClick={() => {
                    setNewAlarm(prev => ({ ...prev, count }));
                    setShowCountPicker(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: newAlarm.count === count ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {count ? `${count}번` : '없음'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name Input */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '16px',
          color: 'rgba(255,255,255,0.9)'
        }}>
          이름 (그룹명)
        </h3>
        <input
          type="text"
          placeholder="입력"
          value={newAlarm.name}
          onChange={(e) => setNewAlarm(prev => ({ ...prev, name: e.target.value }))}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '15px',
            marginBottom: '24px',
            boxSizing: 'border-box'
          }}
        />

        {/* Day Selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            margin: 0
          }}>
            요일 설정
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={newAlarm.days.includes('월') && newAlarm.days.includes('화') && newAlarm.days.includes('수') && newAlarm.days.includes('목') && newAlarm.days.includes('금')}
                onChange={selectWeekdays}
                style={{ accentColor: '#6366f1' }}
              />
              평일
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={newAlarm.days.includes('토') && newAlarm.days.includes('일')}
                onChange={selectWeekend}
                style={{ accentColor: '#6366f1' }}
              />
              주말
            </label>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {['월', '화', '수', '목', '금', '토', '일'].map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: '10px',
                border: 'none',
                background: newAlarm.days.includes(day) ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: newAlarm.days.includes(day) ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Exclude Holidays */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            공휴일 울리지 않기
          </span>
          <div
            onClick={() => setNewAlarm(prev => ({ ...prev, excludeHolidays: !prev.excludeHolidays }))}
            style={{
              width: '51px',
              height: '31px',
              borderRadius: '16px',
              background: newAlarm.excludeHolidays ? '#6366f1' : 'rgba(120,120,128,0.32)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{
              width: '27px',
              height: '27px',
              borderRadius: '14px',
              background: 'white',
              position: 'absolute',
              top: '2px',
              left: newAlarm.excludeHolidays ? '22px' : '2px',
              transition: 'left 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        {/* Sound Selection */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '16px',
          color: 'rgba(255,255,255,0.9)'
        }}>
          사운드
        </h3>
        <div
          onClick={() => setShowSoundPicker(!showSoundPicker)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: showSoundPicker ? '0' : '32px'
          }}
        >
          <span style={{ fontSize: '15px' }}>{newAlarm.sound || '선택'}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        {showSoundPicker && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            marginBottom: '32px',
            overflow: 'hidden'
          }}>
            {['기본', '새소리', '물소리', '알람', '벨소리'].map(sound => (
              <div
                key={sound}
                onClick={() => {
                  setNewAlarm(prev => ({ ...prev, sound }));
                  setShowSoundPicker(false);
                }}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  background: newAlarm.sound === sound ? 'rgba(99,102,241,0.2)' : 'transparent'
                }}
              >
                {sound}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px 32px',
        background: 'linear-gradient(transparent, #111118 30%)',
        maxWidth: '430px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <button
          onClick={createAlarm}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '14px',
            border: 'none',
            background: '#6366f1',
            color: 'white',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          생성하기
        </button>
      </div>
    </div>
  );

  return currentView === 'home' ? <HomeView /> : <CreateView />;
};

export default function Home() {
  return <AlarmApp />;
}
