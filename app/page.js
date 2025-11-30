'use client';

import React, { useState } from 'react';

const AlarmApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('group');
  const [swipedItem, setSwipedItem] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  
  // Bottom sheet states
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: 10, minute: 30 });
  const [tempDays, setTempDays] = useState([]);
  const [tempExcludeHolidays, setTempExcludeHolidays] = useState(true);
  
  // Alarm groups state
  const [alarmGroups, setAlarmGroups] = useState([
    {
      id: 1,
      name: '출근 알람',
      time: '07:30',
      enabled: true,
      days: ['월', '화', '수', '목', '금'],
      excludeHolidays: true,
      alarms: [
        { id: 1, time: '07:30', enabled: true },
        { id: 2, time: '07:35', enabled: true },
        { id: 3, time: '07:40', enabled: true },
      ]
    },
    {
      id: 2,
      name: '주말 알람',
      time: '10:30',
      enabled: true,
      days: ['토', '일'],
      excludeHolidays: false,
      alarms: [
        { id: 1, time: '10:30', enabled: true },
        { id: 2, time: '10:35', enabled: true },
        { id: 3, time: '10:40', enabled: true },
      ]
    },
    {
      id: 3,
      name: '운동',
      time: '06:00',
      enabled: false,
      days: ['월', '수', '금'],
      excludeHolidays: true,
      alarms: [
        { id: 1, time: '06:00', enabled: false },
        { id: 2, time: '06:05', enabled: false }
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

  // Get selected group
  const selectedGroup = alarmGroups.find(g => g.id === selectedGroupId);

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

  // Toggle individual alarm in group
  const toggleGroupAlarm = (groupId, alarmId) => {
    setAlarmGroups(groups =>
      groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            alarms: g.alarms.map(a => 
              a.id === alarmId ? { ...a, enabled: !a.enabled } : a
            )
          };
        }
        return g;
      })
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

  // Open group detail
  const openGroupDetail = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentView('groupDetail');
  };

  // Open time sheet
  const openTimeSheet = () => {
    if (selectedGroup) {
      const [h, m] = selectedGroup.time.split(':').map(Number);
      setTempTime({ hour: h, minute: m });
    }
    setShowTimeSheet(true);
  };

  // Save time from sheet
  const saveTime = () => {
    const timeStr = `${String(tempTime.hour).padStart(2, '0')}:${String(tempTime.minute).padStart(2, '0')}`;
    setAlarmGroups(groups =>
      groups.map(g => g.id === selectedGroupId ? { ...g, time: timeStr } : g)
    );
    setShowTimeSheet(false);
  };

  // Open day sheet
  const openDaySheet = () => {
    if (selectedGroup) {
      setTempDays([...selectedGroup.days]);
      setTempExcludeHolidays(selectedGroup.excludeHolidays);
    }
    setShowDaySheet(true);
  };

  // Save days from sheet
  const saveDays = () => {
    setAlarmGroups(groups =>
      groups.map(g => g.id === selectedGroupId ? { ...g, days: tempDays, excludeHolidays: tempExcludeHolidays } : g)
    );
    setShowDaySheet(false);
  };

  // Toggle temp day
  const toggleTempDay = (day) => {
    setTempDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Handle day toggle for new alarm
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

  // Temp day quick selects
  const selectTempWeekdays = () => {
    setTempDays(['월', '화', '수', '목', '금']);
  };

  const selectTempWeekend = () => {
    setTempDays(['토', '일']);
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
          id: i + 1,
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          enabled: true
        });
      }
    } else {
      alarms.push({ id: 1, time: timeStr, enabled: true });
    }

    const newGroup = {
      id: Date.now(),
      name: newAlarm.name || '새 알람',
      time: timeStr,
      enabled: true,
      days: newAlarm.days,
      excludeHolidays: newAlarm.excludeHolidays,
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

  // Status Bar Component
  const StatusBar = () => (
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
  );

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onToggle, size = 'normal' }) => {
    const width = size === 'small' ? 44 : 51;
    const height = size === 'small' ? 26 : 31;
    const knobSize = size === 'small' ? 22 : 27;
    
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${height / 2}px`,
          background: enabled ? '#6366f1' : 'rgba(120,120,128,0.32)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          flexShrink: 0
        }}
      >
        <div style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: '2px',
          left: enabled ? `${width - knobSize - 2}px` : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    );
  };

  // Bottom Sheet Component
  const BottomSheet = ({ show, onClose, children }) => {
    if (!show) return null;
    
    return (
      <>
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100
          }}
        />
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#1c1c1e',
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          paddingBottom: '40px',
          zIndex: 101,
          maxWidth: '430px',
          margin: '0 auto',
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{
            width: '36px',
            height: '5px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
            margin: '0 auto 20px'
          }} />
          {children}
        </div>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </>
    );
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
      <StatusBar />

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

      {getNextAlarmText() && (
        <div style={{
          padding: '0 24px 20px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '15px'
        }}>
          {getNextAlarmText()}
        </div>
      )}

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
                  onClick={() => setSwipedItem(null)}
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

              <div
                onClick={() => {
                  if (swipedItem === group.id) {
                    setSwipedItem(null);
                  } else {
                    openGroupDetail(group.id);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSwipedItem(swipedItem === group.id ? null : group.id);
                }}
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
                  <ToggleSwitch 
                    enabled={group.enabled} 
                    onToggle={() => toggleGroup(group.id)} 
                  />
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
                <ToggleSwitch enabled={alarm.enabled} onToggle={() => toggleUngrouped(alarm.id)} />
              </div>
            </div>
          ))
        )}
      </div>

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
          justifyContent: 'center'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );

  // Group Detail View
  const GroupDetailView = () => {
    if (!selectedGroup) return null;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        paddingBottom: '40px',
        maxWidth: '430px',
        margin: '0 auto'
      }}>
        <StatusBar />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 24px 16px'
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
          <h1 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>그룹 설정</h1>
          <button style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            marginRight: '-8px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>

        <div style={{
          margin: '0 24px 24px',
          padding: '20px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px'
        }}>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '8px'
          }}>
            {selectedGroup.name}~
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', opacity: 0.6 }}>☽</span>
              <span style={{ fontSize: '48px', fontWeight: '300', letterSpacing: '-2px' }}>
                {selectedGroup.time}
              </span>
            </div>
            <ToggleSwitch 
              enabled={selectedGroup.enabled} 
              onToggle={() => toggleGroup(selectedGroup.id)} 
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {selectedGroup.days.map(day => (
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
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '0 24px',
          marginBottom: '32px'
        }}>
          {[
            { 
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              ), 
              label: selectedGroup.skipToday ? '켜기' : '하루만 끄기', 
              active: selectedGroup.skipToday,
              onClick: () => {
                setAlarmGroups(groups =>
                  groups.map(g => g.id === selectedGroupId ? { ...g, skipToday: !g.skipToday } : g)
                );
              }
            },
            { 
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              ), 
              label: '시간 설정',
              onClick: openTimeSheet
            },
            { 
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M3 10h18"/>
                  <path d="M8 2v4"/>
                  <path d="M16 2v4"/>
                </svg>
              ), 
              label: '요일 설정',
              onClick: openDaySheet
            },
            { 
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3"/>
                  <path d="M18.364 5.636l-2.121 2.121m-8.486 8.486l-2.121 2.121"/>
                  <path d="M5.636 5.636l2.121 2.121m8.486 8.486l2.121 2.121"/>
                </svg>
              ), 
              label: '세부 설정',
              onClick: () => setCurrentView('create')
            },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              style={{
                flex: 1,
                padding: '16px 8px',
                background: btn.active ? '#dc2626' : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ opacity: btn.active ? 1 : 0.6 }}>{btn.icon}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{btn.label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: '0 24px' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            전체 알람
          </h3>
          
          {selectedGroup.alarms.map((alarm) => (
            <div
              key={alarm.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '-1px' }}>
                  {alarm.time}
                </span>
              </div>
              <ToggleSwitch 
                enabled={alarm.enabled} 
                onToggle={() => toggleGroupAlarm(selectedGroup.id, alarm.id)}
                size="small"
              />
            </div>
          ))}
        </div>

        <BottomSheet show={showTimeSheet} onClose={() => setShowTimeSheet(false)}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', textAlign: 'center', marginBottom: '24px' }}>
            시간 수정
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px'
          }}>
            <span style={{ fontSize: '20px', opacity: 0.6, marginRight: '8px' }}>☀</span>
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
                {[tempTime.hour - 2, tempTime.hour - 1, tempTime.hour, tempTime.hour + 1, tempTime.hour + 2].map((h, i) => {
                  const hour = ((h % 24) + 24) % 24;
                  const isCenter = i === 2;
                  return (
                    <div
                      key={i}
                      onClick={() => !isCenter && setTempTime(prev => ({ ...prev, hour }))}
                      style={{
                        fontSize: isCenter ? '32px' : '18px',
                        fontWeight: isCenter ? '600' : '400',
                        color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                        padding: '4px 12px',
                        cursor: isCenter ? 'default' : 'pointer'
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
                {[tempTime.minute - 2, tempTime.minute - 1, tempTime.minute, tempTime.minute + 1, tempTime.minute + 2].map((m, i) => {
                  const minute = ((m % 60) + 60) % 60;
                  const isCenter = i === 2;
                  return (
                    <div
                      key={i}
                      onClick={() => !isCenter && setTempTime(prev => ({ ...prev, minute }))}
                      style={{
                        fontSize: isCenter ? '32px' : '18px',
                        fontWeight: isCenter ? '600' : '400',
                        color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                        padding: '4px 12px',
                        cursor: isCenter ? 'default' : 'pointer'
                      }}
                    >
                      {String(minute).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={saveTime}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '14px',
              border: 'none',
              background: '#6366f1',
              color: 'white',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            저장
          </button>
        </BottomSheet>

        <BottomSheet show={showDaySheet} onClose={() => setShowDaySheet(false)}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', textAlign: 'center', marginBottom: '24px' }}>
            요일 설정
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '16px'
          }}>
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
                checked={['월', '화', '수', '목', '금'].every(d => tempDays.includes(d))}
                onChange={selectTempWeekdays}
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
                checked={['토', '일'].every(d => tempDays.includes(d))}
                onChange={selectTempWeekend}
                style={{ accentColor: '#6366f1' }}
              />
              주말
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['월', '화', '수', '목', '금', '토', '일'].map(day => (
              <button
                key={day}
                onClick={() => toggleTempDay(day)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: tempDays.includes(day) ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: tempDays.includes(day) ? 'white' : 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {day}
              </button>
            ))}
          </div>

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
            <ToggleSwitch 
              enabled={tempExcludeHolidays} 
              onToggle={() => setTempExcludeHolidays(!tempExcludeHolidays)}
              size="small"
            />
          </div>

          <button
            onClick={saveDays}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '14px',
              border: 'none',
              background: '#6366f1',
              color: 'white',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            저장
          </button>
        </BottomSheet>
      </div>
    );
  };

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
      <StatusBar />

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
                  onClick={() => !isCenter && setNewAlarm(prev => ({ ...prev, hour, sleepPreset: null }))}
                  style={{
                    fontSize: isCenter ? '32px' : '18px',
                    fontWeight: isCenter ? '600' : '400',
                    color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    cursor: isCenter ? 'default' : 'pointer'
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
                  onClick={() => !isCenter && setNewAlarm(prev => ({ ...prev, minute, sleepPreset: null }))}
                  style={{
                    fontSize: isCenter ? '32px' : '18px',
                    fontWeight: isCenter ? '600' : '400',
                    color: isCenter ? '#6366f1' : 'rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    cursor: isCenter ? 'default' : 'pointer'
                  }}
                >
                  {String(minute).padStart(2, '0')}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
              cursor: 'pointer'
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
                checked={['월', '화', '수', '목', '금'].every(d => newAlarm.days.includes(d))}
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
                checked={['토', '일'].every(d => newAlarm.days.includes(d))}
                onChange={selectWeekend}
                style={{ accentColor: '#6366f1' }}
              />
              주말
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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
                cursor: 'pointer'
              }}
            >
              {day}
            </button>
          ))}
        </div>

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
          <ToggleSwitch 
            enabled={newAlarm.excludeHolidays} 
            onToggle={() => setNewAlarm(prev => ({ ...prev, excludeHolidays: !prev.excludeHolidays }))}
            size="small"
          />
        </div>

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
            cursor: 'pointer'
          }}
        >
          생성하기
        </button>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'groupDetail':
        return <GroupDetailView />;
      case 'create':
        return <CreateView />;
      default:
        return <HomeView />;
    }
  };

  return renderView();
};

export default function Home() {
  return <AlarmApp />;
}
