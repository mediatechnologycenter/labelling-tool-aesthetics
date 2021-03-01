// Copyright 2021 ETH Zurich, Media Technology Center
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const spearman = {
	
	fixDecimal: function(n){
		return parseFloat((n).toFixed(2));
	},
	
	occurences : function( arr ){
		var occ = {};
		for( var i = 0; i < arr.length; i++ ){
			if( occ.hasOwnProperty(arr[i]) ){
				occ[arr[i]].occured++;
				occ[arr[i]].total += (i+1);
			}else{
				occ[arr[i]] = {
					occured : 1,
					total : (i+1)
				}
			}
		}
		return occ;
	},
	
	rank: function( arr , occurences ){
		return arr.map((currElement, index) => {
			var rank = (index+1)
			var correct = (index+1);
			if( occurences[currElement].occured > 1 ){
				correct = occurences[currElement].total / occurences[currElement].occured;
			}
			return [
				currElement,
				rank,
				correct
			]
		});
	},
	
	findrank: function( n , ranked ){
		var r = 0;
		for( var i = 0; i < ranked.length; i++ ){
			if( n == ranked[i][0] ){
				r = ranked[i][2];
				break;
			}
		}
		return r;
	},
	
	calc: function( d1 , d2 ){
		
		var _d1 = d1;
		var _d2 = d2;
		
		spearman.result = {
			rating: [],
			rank : [],
			d : [],
			d2 : [],
		};
		spearman.total_d = 0;
		spearman.total_d2 = 0;
		spearman.rs = 0;
		
		for(var i=0; i < _d1.length; i++){
			spearman.result.rating.push([
				_d1[i],
				_d2[i]
			]);				
		}
		
		_d1.sort(function(a,b){
			if( a == b ) return 0;
			if( a > b ) return 1;
			if( a < b ) return -1;
		});
		_d2.sort(function(a,b){
			if( a == b ) return 0;
			if( a > b ) return 1;
			if( a < b ) return -1;
		});
		
		var occurences1 = spearman.occurences(_d1);
		var occurences2 = spearman.occurences(_d2);
		
		var ranked1 = spearman.rank( _d1 , occurences1 );
		var ranked2 = spearman.rank( _d2 , occurences2 );
		
		for( var i = 0 ; i < spearman.result.rating.length; i++){
		
			var r1 = spearman.findrank(spearman.result.rating[i][0],ranked1);
			var r2 = spearman.findrank(spearman.result.rating[i][1],ranked2);
			
			spearman.result.rank.push([
				r1,
				r2
			]);	
			
			var d = r1-r2;
			
			spearman.total_d += d;
			spearman.total_d2 += (d*d);
			
			spearman.result.d.push(d);
			spearman.result.d2.push( d * d );
		}
		
		var n = _d1.length;
		var td2 = 0; // total Ed2
		
		
		
		spearman.rs = 1 - ( (6 * spearman.total_d2) / ( n * ( (n*n) - 1 ) ) );
		
		return spearman.fixDecimal(spearman.rs,2);
		
	}

};