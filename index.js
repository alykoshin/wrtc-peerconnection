/**
 * Created by alykoshin on 9/9/14.
 */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('mini-debug');
  var Emitter = require('mini-emitter');
}

/**
 * Low-level wrapper for RTCPeerConnection
 *
 * @class WrtcPeerConnection
 * @constructor
 * @returns {WrtcPeerConnection}
 * private
 */

var WrtcPeerConnection = function() {
  var self = this;
  Emitter(self);

  /**
   * @name rtcPeerConnection
   * @memberOf WrtcPeerConnection
   * @type {RTCPeerConnection}
   * private
   */
  var rtcPeerConnection = null;

  /**
   * @name rtcPeerConnection
   * @memberOf WrtcPeerConnection
   * @type {RTCPeerConnection}
   * @readOnly
   */
  Object.defineProperty(self, 'rtcPeerConnection', {
    get: function () {
      return rtcPeerConnection;
    }
  });

  /**
   * @name signalingState
   * @memberOf WrtcPeerConnection
   * @type {RTCSignalingState}
   * @readOnly
   */
  Object.defineProperty(self, 'signalingState', {
    /** @returns {RTCSignalingState} */
    get:
      function () {
        return rtcPeerConnection ? rtcPeerConnection.signalingState : null;
      }
  });

  /**
   * @name iceConnectionState
   * @memberOf WrtcPeerConnection
   * @type {RTCIceConnectionState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceConnectionState', {
    /** @returns {RTCIceConnectionState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceConnectionState : null;
    }
  });

  /**
   * @name iceConnectionState
   * @memberOf WrtcPeerConnection
   * @type {RTCIceGatheringState}
   * @readOnly
   */
  Object.defineProperty(self, 'iceGatheringState', {
    /** @returns {RTCIceGatheringState} */
    get: function () {
      return rtcPeerConnection ? rtcPeerConnection.iceGatheringState : null;
    }
  });

  /**
   *
   * @param rtcConfiguration
   */
  self._createPeerConnection = function(rtcConfiguration) {

    // Create the WebRTC object RTCConnection

    //debug.log('WrtcPeerConnection._createPeerConnection(): rtcConfiguration:' + JSON.stringify(rtcConfiguration, null, 2));
    rtcPeerConnection = new RTCPeerConnection(rtcConfiguration);

    // Set RTCConnection events

    /**
     * @type RTCPeerConnection#onaddstream
     * @fires _addstream
     */
    rtcPeerConnection.onaddstream = function(ev) {
      self.emit('_addstream',    ev);
    };

    /**
     * @type RTCPeerConnection#ondatachannel
     * @fires _datachannel
     */
    rtcPeerConnection.ondatachannel = function(ev) {
      self.emit('_datachannel',  ev);
    };

    /**
     * @type RTCPeerConnection#onicecandidate
     * @fires _icecandidate
     */
    rtcPeerConnection.onicecandidate = function(ev) {
      self.emit('_icecandidate', ev);
    };

    /**
     * @type RTCPeerConnection#oniceconnectionstatechange
     * @fires _iceconnectionstatechange
     */
    rtcPeerConnection.oniceconnectionstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      // while rtcPeerConnection may still emit events
      //debug.log('rtcPeerConnection.oniceconnectionstatechange(); iceConnectionState:', ev.target.iceConnectionState, '; iceGatheringState:',  ev.target.iceGatheringState, '; ev:', ev);
      self.emit('_iceconnectionstatechange', ev);
    };

    /**
     * @type RTCPeerConnection#onnegotiationneeded
     * @fires _negotiationneeded
     */
    rtcPeerConnection.onnegotiationneeded = function(ev) {
      self.emit('_negotiationneeded', ev);
    };

    /**
     * @type RTCPeerConnection#onremovestream
     * @fires _removestream
     */
    rtcPeerConnection.onremovestream = function(ev) {
      self.emit('_removestream', ev);
    };

    /**
     * @type RTCPeerConnection#onsignalingstatechange
     * @fires _signalingstatechange
     */
    rtcPeerConnection.onsignalingstatechange = function(ev) {
      // It's better not to access self object as during destruction it may be already null
      // while rtcPeerConnection may still emit events
      //debug.log('rtcPeerConnection.onsignalingstatechange(): signalingState:', ev.target.signalingState, '; ev:', ev);
      self.emit('_signalingstatechange', ev);
    };

  };

  /**
   * Cleanup - close rtcPeerConnection and set it to null
   *
   * @memberOf _RTCPeerConnection
   */

  self.cleanup = function() {
    //debug.log('_RTCPeerConnection.cleanup()');
    self.emit('close', self);
    rtcPeerConnection.close();  // Close connection RTCPeerConnection
    rtcPeerConnection = null;   // Remove reference to it
  };

  /**
   *
   * @param localDescription
   * @private
   */
  self._createOfferSuccess = function(localDescription) {
    //debug.log('WrtcPeerConnection._createOfferSuccess: localDescription:', localDescription);
    self.emit('_createOfferSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @private
   */
  self._createOfferError = function(error) {
    //debug.log('WrtcPeerConnection._createOfferError: error:', error);
    self.emit('_createOfferError',   error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _offerSuccess
   * @fires _offerError
   */
  self._createOffer = function(constraints) {
    self.emit('_createOffer', constraints);
    rtcPeerConnection.createOffer( self._createOfferSuccess, self._createOfferError, constraints);
  };

  /**
   *
   * @param localDescription
   * @fires _createAnswerSuccess
   * @private
   */
  self._createAnswerSuccess = function(localDescription) {
    self.emit('_createAnswerSuccess', localDescription);
  };

  /**
   *
   * @param error
   * @fires _createAnswerError
   * @private
   */
  self._createAnswerError = function(error) {
    self.emit('_createAnswerError', error);
  };

  /**
   *
   * @param {RTCOfferConstraints} constraints
   * @fires _answerSuccess
   * @fires _answerError
   */
  self._createAnswer = function(constraints) {
    self.emit('_createAnswer', constraints);
    rtcPeerConnection.createAnswer( self._createAnswerSuccess, self._createAnswerError, constraints);
  };

  /**
   * @method _addLocalStream
   * @memberOf WrtcPeerConnection
   * @param {MediaStream} stream
   * @fires _addLocalStream - BEFORE calling RTCPeerConnection.addStream
   */
  self._addLocalStream = function (stream) {
    self.emit('_addLocalStream', stream);
    rtcPeerConnection.addStream( stream );
  };
  //self.on('_addLocalStream',  function(ev) { debug.log('WrtcPeerConnection._addLocalStream(): ev:', ev); } );

  /**
   * @memberOf WrtcPeerConnection
   * @param {RTCSessionDescription} localDescription
   * @fires _setLocalDescription - BEFORE calling RTCPeerConnection.setLocalDescription
   */
  self._setLocalDescription = function(localDescription) {
    self.emit('_setLocalDescription', localDescription);
    self.rtcPeerConnection.setLocalDescription(localDescription);
  };
  //self.on('_setLocalDescription',  function(ev) { debug.log('WrtcPeerConnection.on(): _setLocalDescription(): ev:', ev); } );

  /**
   * @memberOf WrtcPeerConnection
   * @param {RTCSessionDescription} remoteDescription
   * @fires _setRemoteDescription - BEFORE calling RTCPeerConnection.setRemoteDescription
   */
  self._setRemoteDescription = function(remoteDescription) {
    self.emit('_setRemoteDescription', remoteDescription);
    self.rtcPeerConnection.setRemoteDescription( new RTCSessionDescription(remoteDescription) );
  };

  //return self;
};

//

if (typeof module !== 'undefined') {
  module.exports = WrtcPeerConnection;
}

if (typeof window !== 'undefined') {
  window.WrtcPeerConnection = WrtcPeerConnection;
}

